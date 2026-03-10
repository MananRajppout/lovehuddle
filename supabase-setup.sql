-- =============================================
-- LoveHuddle Supabase Setup
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =============================================

-- 1. Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    excerpt VARCHAR(1000),
    content TEXT NOT NULL,
    date VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create waitlist_entries table
CREATE TABLE IF NOT EXISTS waitlist_entries (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    date VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Disable RLS (Row Level Security) for simple public access
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_entries DISABLE ROW LEVEL SECURITY;

-- 4. Seed default blog posts
INSERT INTO blog_posts (title, excerpt, content, date) VALUES
(
    'Why I''m Building a Dating Platform Without Swiping or Paywalls',
    'Dating apps were created to help people connect — but somewhere along the way, they became noisy, rushed, and transactional.',
    'Dating apps were created to help people connect — but somewhere along the way, they became noisy, rushed, and transactional. Swipe left, swipe right, repeat. Paywalls everywhere. Matches that go nowhere. Conversations that never start. It''s a system built for speed, not for people.

Living here in Wales, I''ve seen the same frustration that many adults across the UK feel: dating apps have become exhausting. They push you to scroll, judge quickly, and move on even faster. They''re designed to keep you hooked, not to help you meet someone meaningful.

So I decided to build something different.

LoveHuddle is a new kind of dating platform — a calm, human-centred alternative for adults who want real connection without the pressure. No swiping. No paywalls. No tricks. Just a slower, more intentional way to meet someone who genuinely fits your life.

The problem with swiping

Swiping looks simple, but it creates a fast, disposable mindset. You''re encouraged to make instant decisions based on a photo and a split-second reaction. It''s addictive, but it''s not meaningful.

LoveHuddle removes swiping entirely. Instead of chasing matches, you build connection through small, thoughtful daily questions — simple prompts that help people open up naturally. Not interviews. Not forms. Just real conversation, one step at a time.

Why there are no paywalls

Most dating apps hide the best features behind subscriptions. Want to see who liked you? Pay. Want to message someone? Pay. Want to boost your profile? Pay again.

LoveHuddle is different. There are no hidden fees and no premium tiers. Everyone gets the same experience. Everyone has the same chance to connect. Because connection shouldn''t be something you have to unlock.

A calmer, more human way to meet people

LoveHuddle is built for adults who want something real — people who are tired of the noise, the pressure, and the endless scrolling. It''s for those who value depth over speed, honesty over performance, and conversation over algorithms.

This platform is being built intentionally, step by step, with a simple mission: Create a space where adults can connect without being rushed, pushed, or sold to.

If that resonates with you, you''re in the right place. LoveHuddle is for people who want connection that feels human again — and this is just the beginning.',
    'Feb 24, 2026'
),
(
    'The Death of the Algorithm',
    'Why swiping is killing human connection and how we''re fixing it.',
    'For too long, our social lives have been dictated by algorithms designed to keep us scrolling rather than meeting. LoveHuddle is stripping away the digital barriers to bring back genuine human moments.

The dating industry has become a machine — one that profits from loneliness, not from love. Every time you swipe, you feed the algorithm. Every paywall you encounter is designed to exploit your desire for connection.

We believe that meaningful relationships start with meaningful conversations. Not with a split-second swipe based on a heavily filtered photo.

LoveHuddle''s approach is fundamentally different. We''re building technology that gets out of the way — that facilitates real human interaction rather than replacing it with an addictive digital substitute.

Stay tuned for more updates as we approach the build phase in March 2026.',
    'Feb 24, 2026'
),
(
    'Built in Wales, for the UK',
    'The journey of a solo founder disrupting Silicon Valley.',
    'Tech doesn''t just belong to big corporations in California. LoveHuddle is architected in Wales, built with the UK community at its heart. We believe in ethical, local impact over distant profit.

The UK dating scene deserves better than recycled Silicon Valley products. We deserve platforms that understand our culture, our values, and our way of life.

As a solo founder based in Wales, I''ve seen firsthand how technology can either bring communities together or tear them apart. LoveHuddle is my answer to the question: what would a dating platform look like if it were built by someone who actually cared about the people using it?

Every design decision, every feature, every policy is made with one question in mind: does this help real people make real connections?

Stay tuned for more updates as we approach the build phase in March 2026.',
    'Feb 20, 2026'
),
(
    'The Summer 2026 Vision',
    'What to expect when we launch nationally.',
    'Launching a platform without paywalls is a bold move. Here is the roadmap for how we will reach every corner of the UK by Summer 2026, ensuring safety and authenticity with every connection.

Our vision is simple but ambitious: create the UK''s most trusted, most human dating platform — one that puts people before profit.

Phase 1 is our closed beta, where our founding 500 members will shape the platform''s future. Phase 2 expands to major UK cities. Phase 3 is the full national rollout.

At every stage, safety comes first. Our one-time verification process ensures that every person on LoveHuddle is exactly who they say they are.

Stay tuned for more updates as we approach the build phase in March 2026.',
    'Feb 15, 2026'
);
