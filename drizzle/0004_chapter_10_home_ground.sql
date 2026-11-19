-- Insert "Chapter 10: Home Ground, Heavy Static" and push the old chapter 10 (Part 3) to chapter 11.
UPDATE "book_chapters"
SET "chapter_number" = '11', "slug" = 'chapter-11-the-long-game', "updated_at" = now()
WHERE "slug" = 'chapter-10-the-long-game';
--> statement-breakpoint
INSERT INTO "book_chapters"
  ("part_id", "chapter_number", "slug", "title", "subtitle", "status", "summary", "content_markdown",
   "reading_time_minutes", "related_project_slugs", "media", "published_at", "sort_order")
SELECT
  (SELECT "id" FROM "book_parts" WHERE "part_number" = 2),
  '10', 'chapter-10-home-ground-heavy-static', 'Home Ground, Heavy Static', '', 'wip_published',
  $sum$There is a particular kind of irony in coming home to do the hardest migration of your career.$sum$,
  $body$There is a particular kind of irony in coming home to do the hardest migration of your career.

In January 2026, after six years of building digital platforms and battling through back-to-back cutovers in Singapore, I packed up my life and returned to Kuala Lumpur. The plan was straightforward on paper: step into Maxis as Program Director for IT Transformation, take ownership of a full-stack BSS overhaul, and steer the ship from legacy architecture onto a modern stack.

On paper, it looked like a natural next chapter. In reality, it felt like walking into a live server room where the racks were already humming at redline, the blueprints were still being debated, and half the stakeholders had different ideas of where the doors were supposed to be.

If Part 1 of my career was learning how to read a single signal, and Singapore was learning how to build platforms from scratch, Maxis became the ultimate stress test in signal-to-noise ratio.

## The Anatomy of a Full-Stack Beast

Anyone who has worked inside a tier-one telco knows that replacing a Business Support System isn't a software upgrade—it’s open-heart surgery while the patient is running a half-marathon.

The scope wasn't a neat, isolated greenfield sandbox. It was the entire nervous system of the business: CRM, Product Catalog, Billing and Charging, and the dense web of integration layers holding everything together. On one side sat the core platform vendor, carrying their own playbooks, timelines, and delivery rhythms. On the other sat an ecosystem of more than a hundred surrounding third-party systems—legacy touchpoints, downstream dependencies, payment gateways, partner interfaces, and custom workarounds built over decades.

When you have over a hundred external systems wired into a core transformation, every single interface is a potential single point of failure. A minor schema change in one corner triggers a silent timeout three hops away. A delayed sign-off in one business unit freezes an end-to-end test cycle across five squads. You don’t just manage a project plan at that scale; you manage a living, breathing spiderweb where pulling one thread vibrates the entire room.

## When the Static Isn’t in the Code

In my earlier years, I used to think the hardest problems lived inside log files, protocol traces, and architecture diagrams. Give me a broken link or a failing charging flow, and I knew how to isolate the fault, trace the packet, and fix it.

By 2026, I knew better. The heaviest static rarely comes from the servers. It comes from people.

Stepping into an entrenched transformation meant inheriting more than technical debt—it meant stepping into a less-than-ideal working environment shaped by competing agendas, territorial habits, and stakeholders who viewed change as a threat rather than a lifeline. Alignment wasn't given; it had to be wrestled out of every meeting.

Then there was the friction from above. Navigating difficult managers while trying to shield a delivery team from organizational whiplash is an art form nobody teaches in engineering school. When leadership styles clash—when escalation becomes a reflex instead of a tool, or when optics matter more than actual architectural readiness—you quickly realize that your real job isn't just technical governance. It’s acting as a human voltage regulator. You absorb the spikes from the top so the engineers and leads on the ground have enough clean power to actually build.

There were days when the environment tested every ounce of patience I had accumulated over twenty-five years. Days when stakeholder politics consumed more bandwidth than system integration. Days when the easiest thing in the world would have been to step back, point at the org chart, and let the friction win.

## Breakfast War Rooms and Lunchtime Kopi

When the official calendar is packed with rigid governance calls and uphill stakeholder battles, you learn quickly that the real work rarely happens inside the formal meeting invite. It happens around food.

Most mornings, before the office even officially wakes up and the inbox starts screaming, the working team and I gather for breakfast. No slide decks, no formal minutes, no posturing—just half-boiled eggs, toast, and candid conversation. Over that quiet hour before the daily storm hits, we catch up as human beings first, then untangle the messiest blockers on the board. Problems that would take three escalation emails and a two-hour committee call to dissect get sorted out in fifteen minutes between bites. It sets our compass before we even badge into the building.

And by midday, after surviving the morning's regular meeting cadence—the status interrogations, the shifting goalposts, the relentless pressure—lunchtime *kopi* becomes our pressure-release valve. Sitting together away from the screens, venting over coffee and trading dry jokes about the absurdity of corporate life, the tension finally drops. Laughter in the middle of a grueling transformation isn't a distraction; it’s oxygen. Those shared breaks remind us we aren't just cogs grinding through a migration plan—we're a crew watching each other's backs, and that camaraderie is what keeps everyone showing up tomorrow.

## Ploughing Through for the Long Game

We didn't back down.

When the environment isn't ideal and the management terrain is rough, you fall back on what has always worked in the trenches: clarity, cadence, and stubborn persistence.

You stop waiting for perfect organizational harmony—because in a transformation of this size, it never arrives—and start focusing ruthlessly on the target outcome. You break the hundred-system monster down into concrete, non-negotiable milestones. You translate vague stakeholder anxieties into clear technical dependencies. You protect your morning rituals, guard your team's morale over *kopi*, and keep pushing forward, one resolved blocker at a time.

It isn't glamorous work. There are no celebratory launch photos yet—this chapter is still being written in real time, in breakfast stalls, integration war rooms, and late-evening syncs across Kuala Lumpur.

But that is the real test of the builder's mindset. Anyone can lead when the wind is at their back, the team is hand-picked, and the mandate is crystal clear. You find out what your twenty-five years of scar tissue are actually worth when the weather turns, the static gets loud, and you still keep the signal moving toward the finish line.

---

## Signal Debrief: Leading When the Static Gets Loud

- **The Situation:** Returning home to lead a full-stack BSS transformation across CRM, Product Catalog, Billing and Charging, a core platform vendor, and more than 100 third-party integrations inside a complex organizational environment.
- **The Noise:** Competing stakeholder agendas, territorial friction, difficult management dynamics, rigid status-meeting cadences, and the sheer technical sprawl of over a hundred interconnected systems.
- **The Signal:** In a large-scale transformation, formal governance rarely creates alignment—informal trust does. Shielding your builders from top-down turbulence and creating unscripted spaces (before the workday starts and over midday *kopi*) unlocks faster problem-solving and sustains morale far better than another escalation call.
- **How to Use This Signal:**
  - **Be the voltage regulator:** Absorb unreasonable executive pressure at your level instead of passing raw panic down to your engineering and delivery leads.
  - **Create zero-slide rituals:** Establish a casual, pre-meeting touchpoint with your core working team to clear real blockers before corporate theater begins.
  - **Protect the pressure valve:** Never underestimate shared breaks and humor during a multi-year grind—psychological safety and camaraderie are operational necessities, not perks.$body$,
  6, '[]'::jsonb, '[]'::jsonb, now(),
  COALESCE((SELECT "sort_order" FROM "book_chapters" WHERE "slug" = 'chapter-9-1-the-all-star-constellation'), 130) + 5
WHERE NOT EXISTS (SELECT 1 FROM "book_chapters" WHERE "slug" = 'chapter-10-home-ground-heavy-static');
