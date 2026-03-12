# Lead Assignment Engine — API Specification

These are the new endpoints to build on top of the existing API.

---

## `POST /api/leads/incoming`

Receives a new lead and automatically assigns it to an agent.

**Request body:**
```json
{
  "source": "Google Ads",
  "status": "New",
  "revenue": 5000.00
}
```

**Response:** The created lead including which agent it was assigned to.

**Assignment rules:**
- Assign to the agent with the fewest open leads
- An agent can hold a maximum of 10 open leads at one time

---

## `PATCH /api/leads/{id}/status`

Updates the status of a lead.

**Request body:**
```json
{
  "status": "Accepted"
}
```

**Valid statuses:** `Accepted`, `Closed`, `Rejected`

**Rules:**
- If status is `Rejected`, the lead must be reassigned to the next available agent automatically
- A history log entry must be created for every status change
- History log entries can never be modified or deleted

---

## `GET /api/agents/workload`

Returns the current open lead count for every agent.

**Example response:**
```json
[
  { "agent_name": "Sarah Johnson", "open_leads": 4 },
  { "agent_name": "Mike Chen", "open_leads": 7 },
  { "agent_name": "Lisa Williams", "open_leads": 2 }
]
```

---

## Testing Script

Use this script to simulate leads arriving at 1 per second while the app is running:

```python
# simulate_leads.py
import requests
import random
import time

SOURCES = ["Google Ads", "Facebook", "LinkedIn", "Referral", "Cold Call"]

while True:
    payload = {
        "source": random.choice(SOURCES),
        "status": "New",
        "revenue": round(random.uniform(500, 20000), 2)
    }
    try:
        res = requests.post("http://localhost:8001/api/leads/incoming", json=payload)
        print(f"Lead created: {res.json()}")
    except Exception as e:
        print(f"Error: {e}")
    time.sleep(1)
```

Also generate and upload the 100k test CSV (using `scripts/generate_data.py`) to verify that your performance fixes work at scale.
