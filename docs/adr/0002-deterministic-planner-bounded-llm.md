# Deterministic planner with a bounded LLM

The planning engine is deterministic TypeScript rules on the server. The LLM is confined to four jobs: triage Inbox items, propose next Steps for a Quest, generate "Why this?" explanations, and write System Messages.

Chosen because the core promise — "the system does the planning" — must be reproducible, testable, and not dependent on a hosted model's latency or availability. A full LLM-driven planner was rejected for the MVP: it would make the critical path flaky and hard to reason about. The LLM improves the edges; the rules stay the spine.
