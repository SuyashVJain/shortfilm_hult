import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import {
  DEFAULT_SETTINGS,
  SETTING_KEYS,
  settingsSchema,
  type SettingKey,
  type Settings,
} from "@/lib/settings-defaults";

export { DEFAULT_SETTINGS, type SettingKey, type Settings } from "@/lib/settings-defaults";

/**
 * All event settings: stored rows merged over defaults.
 * A stored value that fails validation falls back to its default, so a bad
 * edit can never break the site. Cached per request.
 */
export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await db.eventSetting.findMany();
  const merged: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    if (!SETTING_KEYS.includes(row.key as SettingKey)) continue;
    const key = row.key as SettingKey;
    // A JSON null (stored as Prisma.JsonNull) reads back as plain null, which
    // the nullable scoringScale schema accepts.
    const parsed = settingsSchema.shape[key].safeParse(row.value);
    if (parsed.success) merged[key] = parsed.data;
  }
  return merged as Settings;
});

export async function getSetting<K extends SettingKey>(key: K): Promise<Settings[K]> {
  return (await getSettings())[key];
}

/** Open only when the admin switch is on AND the deadline has not passed. */
export async function isRegistrationOpen(now = new Date()) {
  const { registrationOpen, registrationDeadline } = await getSettings();
  return registrationOpen && now <= new Date(registrationDeadline);
}
