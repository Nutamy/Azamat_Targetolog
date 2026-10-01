-- One shared schema for every invitation page; "site" separates them (m7 = birthday, wed = wedding).
-- pub  = JSON the page may show to other guests; priv = JSON only the owner key can read.
CREATE TABLE IF NOT EXISTS rsvp (site TEXT NOT NULL, guest_id TEXT NOT NULL, pub TEXT NOT NULL, priv TEXT NOT NULL DEFAULT '{}', ts INTEGER NOT NULL, PRIMARY KEY (site, guest_id));
CREATE TABLE IF NOT EXISTS gifts (site TEXT NOT NULL, gift_id TEXT NOT NULL, guest_id TEXT NOT NULL, name TEXT NOT NULL DEFAULT '', ts INTEGER NOT NULL, PRIMARY KEY (site, gift_id));
