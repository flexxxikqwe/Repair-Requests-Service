# User Prompts

This file contains a history of the prompts used by the user during this session.

## Prompt 1
> Continue

## Prompt 2
> Fix the frames on dropdowns exactly on the Masters Dashboard "identify yourself" button

## Prompt 3
> Review the current project and align it strictly with the following technical assignment:
>
> "Repair Service Requests Web App"
>
> IMPORTANT:
> Do NOT rewrite the project from scratch.
> Do NOT break existing working functionality.
> Only adjust and complete missing requirements.
>
> --------------------------------
> CORE REQUIREMENTS
> --------------------------------
>
> Roles:
> - dispatcher
> - master
>
> Simple authentication:
> - user selection OR login (use seeded users)
>
> --------------------------------
> REQUEST MODEL
> --------------------------------
>
> Ensure Request has fields:
>
> - clientName (required)
> - phone (required)
> - address (required)
> - problemText (required)
> - status: new | assigned | in_progress | done | canceled
> - assignedTo (masterId, nullable)
> - createdAt
> - updatedAt
>
> Fix inconsistencies if any.
>
> --------------------------------
> PAGES (REQUIRED)
> --------------------------------
>
> 1. Create Request Page
> - form with required fields
> - after submit → status = "new"
>
> 2. Dispatcher Dashboard
> - list of all requests
> - filter by status
> - assign master → status = "assigned"
> - cancel request → status = "canceled"
>
> 3. Master Dashboard
> - list of requests assigned to current master
> - "Take request" → assigned → in_progress
> - "Finish request" → in_progress → done
>
> --------------------------------
> RACE CONDITION (CRITICAL)
> --------------------------------
>
> Ensure endpoint:
>
> POST /requests/:id/take
>
> is race-condition safe.
>
> Implementation must use atomic update:
>
> UPDATE ... WHERE status = 'assigned'
>
> If update fails → return 409 Conflict.
>
> --------------------------------
> SEEDS
> --------------------------------
>
> Ensure seeds include:
>
> - 1 dispatcher
> - 2 masters
> - several test requests
>
> --------------------------------
> TESTING
> --------------------------------
>
> Ensure at least 2 tests exist:
>
> - request creation
> - race condition test
>
> --------------------------------
> SCRIPT
> --------------------------------
>
> Ensure race_test.sh:
>
> - creates a new request
> - assigns it
> - sends 2 parallel /take requests
> - outputs:
>   one 200
>   one 409
>
> --------------------------------
> README.md
> --------------------------------
>
> Ensure README includes:
>
> - how to run project
> - test users
> - how to test race condition (curl or script)
>
> --------------------------------
> PROJECT STRUCTURE
> --------------------------------
>
> Ensure code is clean:
>
> - routes
> - services
> - db
>
> --------------------------------
> UI REQUIREMENTS
> --------------------------------
>
> Ensure UI:
>
> - works correctly
> - has no broken buttons
> - filters work
> - forms validate input
> - error messages are shown
>
> Do NOT redesign UI.
>
> --------------------------------
> OUTPUT
> --------------------------------
>
> 1. List of missing or incorrect parts
> 2. Fixed code snippets
> 3. Updated files (README, seeds, endpoints if needed)
> 4. Explanation of changes

## Prompt 4
> Can u create prompts.md and put all of my used prompts into it?
