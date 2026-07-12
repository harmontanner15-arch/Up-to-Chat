import { supabase } from '../lib/supabase';
import { AlertItem, Circle, Member } from './types';

type ProfileRow = { id: string; first_name: string; avatar_color: number };

export type ActiveStatusRow = {
  id: string;
  activity: string;
  duration_minutes: number;
  started_at: string;
  ends_at: string;
};

function toMember(profile: ProfileRow): Member {
  return {
    id: profile.id,
    initials: profile.first_name.charAt(0).toUpperCase(),
    colorIndex: profile.avatar_color,
  };
}

function relativeTimeFrom(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, first_name, avatar_color')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchCircles(userId: string): Promise<Circle[]> {
  const { data: memberRows, error: memberErr } = await supabase
    .from('circle_members')
    .select('circle_id')
    .eq('user_id', userId);
  if (memberErr) throw memberErr;
  const circleIds = (memberRows ?? []).map((r: { circle_id: string }) => r.circle_id);
  if (circleIds.length === 0) return [];

  const { data: circleRows, error: circleErr } = await supabase
    .from('circles')
    .select('id, name')
    .in('id', circleIds);
  if (circleErr) throw circleErr;

  const { data: allMembers, error: allMembersErr } = await supabase
    .from('circle_members')
    .select('circle_id, profiles!user_id(id, first_name, avatar_color)')
    .in('circle_id', circleIds);
  if (allMembersErr) throw allMembersErr;

  const nowIso = new Date().toISOString();
  const { data: activeLinks, error: activeErr } = await supabase
    .from('status_circles')
    .select('circle_id, availability_status!inner(user_id, is_active, ends_at)')
    .in('circle_id', circleIds)
    .eq('availability_status.is_active', true)
    .gt('availability_status.ends_at', nowIso);
  if (activeErr) throw activeErr;

  const membersByCircle = new Map<string, Member[]>();
  for (const row of allMembers ?? []) {
    const profile = row.profiles as unknown as ProfileRow | null;
    if (!profile) continue;
    const list = membersByCircle.get(row.circle_id) ?? [];
    list.push(toMember(profile));
    membersByCircle.set(row.circle_id, list);
  }

  const activeByCircle = new Map<string, Set<string>>();
  for (const row of activeLinks ?? []) {
    const status = row.availability_status as unknown as { user_id: string } | null;
    if (!status) continue;
    const set = activeByCircle.get(row.circle_id) ?? new Set<string>();
    set.add(status.user_id);
    activeByCircle.set(row.circle_id, set);
  }

  return (circleRows ?? []).map((circle: { id: string; name: string }) => {
    const members = membersByCircle.get(circle.id) ?? [];
    return {
      id: circle.id,
      name: circle.name,
      members,
      memberCount: members.length,
      activeCount: activeByCircle.get(circle.id)?.size ?? 0,
    };
  });
}

export async function createCircle(userId: string, name: string): Promise<Circle> {
  const { data: circle, error } = await supabase
    .from('circles')
    .insert({ name, owner_id: userId })
    .select('id, name')
    .single();
  if (error) throw error;

  const { error: memberErr } = await supabase
    .from('circle_members')
    .insert({ circle_id: circle.id, user_id: userId, role: 'owner' });
  if (memberErr) throw memberErr;

  const profile = await fetchProfile(userId);

  return {
    id: circle.id,
    name: circle.name,
    members: profile ? [toMember(profile)] : [],
    memberCount: 1,
    activeCount: 0,
  };
}

export async function fetchMyActiveStatus(userId: string): Promise<ActiveStatusRow | null> {
  const { data, error } = await supabase
    .from('availability_status')
    .select('id, activity, duration_minutes, started_at, ends_at')
    .eq('user_id', userId)
    .eq('is_active', true)
    .gt('ends_at', new Date().toISOString())
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function goUpToChat(
  userId: string,
  activity: string,
  durationMinutes: number,
  circleIds: string[]
): Promise<ActiveStatusRow> {
  await supabase.from('availability_status').update({ is_active: false }).eq('user_id', userId).eq('is_active', true);

  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + durationMinutes * 60_000);

  const { data: status, error } = await supabase
    .from('availability_status')
    .insert({
      user_id: userId,
      activity,
      duration_minutes: durationMinutes,
      started_at: startedAt.toISOString(),
      ends_at: endsAt.toISOString(),
      is_active: true,
    })
    .select('id, activity, duration_minutes, started_at, ends_at')
    .single();
  if (error) throw error;

  if (circleIds.length > 0) {
    const { error: linkErr } = await supabase
      .from('status_circles')
      .insert(circleIds.map((circle_id) => ({ status_id: status.id, circle_id })));
    if (linkErr) throw linkErr;
  }

  return status;
}

export async function cancelUpToChat(statusId: string): Promise<void> {
  const { error } = await supabase.from('availability_status').update({ is_active: false }).eq('id', statusId);
  if (error) throw error;
}

type EmbeddedStatus = {
  id: string;
  user_id: string;
  activity: string;
  duration_minutes: number;
  started_at: string;
  ends_at: string;
  is_active: boolean;
  profiles: { first_name: string; avatar_color: number } | null;
};

export async function fetchAlerts(userId: string): Promise<AlertItem[]> {
  const { data: memberRows, error: memberErr } = await supabase
    .from('circle_members')
    .select('circle_id')
    .eq('user_id', userId);
  if (memberErr) throw memberErr;
  const circleIds = (memberRows ?? []).map((r: { circle_id: string }) => r.circle_id);
  if (circleIds.length === 0) return [];

  const { data: dismissedRows } = await supabase
    .from('alert_dismissals')
    .select('status_id')
    .eq('user_id', userId);
  const dismissedIds = new Set((dismissedRows ?? []).map((r: { status_id: string }) => r.status_id));

  const { data, error } = await supabase
    .from('status_circles')
    .select(
      'circle_id, availability_status!inner(id, user_id, activity, duration_minutes, started_at, ends_at, is_active, profiles!user_id(first_name, avatar_color))'
    )
    .in('circle_id', circleIds)
    .neq('availability_status.user_id', userId);
  if (error) throw error;

  const seen = new Set<string>();
  const alerts: AlertItem[] = [];
  for (const row of data ?? []) {
    const status = row.availability_status as unknown as EmbeddedStatus | null;
    if (!status || !status.profiles) continue;
    if (seen.has(status.id) || dismissedIds.has(status.id)) continue;
    seen.add(status.id);

    const isLive = status.is_active && new Date(status.ends_at).getTime() > Date.now();
    alerts.push({
      id: status.id,
      member: {
        id: status.user_id,
        initials: status.profiles.first_name.charAt(0).toUpperCase(),
        colorIndex: status.profiles.avatar_color,
      },
      name: status.profiles.first_name,
      isLive,
      activity: status.activity,
      timeLabel: isLive ? 'now' : relativeTimeFrom(status.started_at),
      relativeTime: relativeTimeFrom(status.started_at),
    });
  }

  alerts.sort((a, b) => (a.isLive === b.isLive ? 0 : a.isLive ? -1 : 1));
  return alerts;
}

export async function dismissAlert(userId: string, statusId: string): Promise<void> {
  const { error } = await supabase.from('alert_dismissals').insert({ user_id: userId, status_id: statusId });
  if (error) throw error;
}

export async function inviteToCircle(circleId: string, email: string): Promise<Member> {
  const { data: matches, error: lookupErr } = await supabase.rpc('find_profile_by_email', {
    p_email: email.trim(),
  });
  if (lookupErr) throw lookupErr;
  const profile = (matches ?? [])[0] as ProfileRow | undefined;
  if (!profile) {
    throw new Error('No Up to Chat account found for that email.');
  }

  const { error: memberErr } = await supabase
    .from('circle_members')
    .insert({ circle_id: circleId, user_id: profile.id, role: 'member' });
  if (memberErr) {
    if (memberErr.code === '23505') {
      throw new Error('That person is already in this circle.');
    }
    throw memberErr;
  }

  return toMember(profile);
}
