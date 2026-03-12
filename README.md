# Lead Analytics Dashboard

Internal analytics dashboard for call center lead management.

## Tech Stack

- **Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL
- **Frontend:** React, Chart.js

## Setup

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL running locally

### Database

```bash
createdb lead_analytics
```

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

API runs at `http://localhost:8001`
API docs at `http://localhost:8001/docs`

### Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`

### Load Test Data

```bash
cd scripts
python generate_data.py
curl -X POST "http://localhost:8001/api/upload-csv" -F "file=@leads_100k.csv"
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Dashboard metrics |
| GET | `/api/analytics/leads-by-source` | Leads grouped by source |
| GET | `/api/analytics/top-agents` | Top performing agents |
| GET | `/api/leads` | All leads |
| POST | `/api/upload-csv` | Upload CSV lead data |

## CSV Format

```csv
LeadID,Agent,Source,Status,Revenue,CreatedAt
1,Sarah Johnson,Google Ads,Converted,15000.00,2024-01-15 10:30:00
```

Valid statuses: `New`, `Contacted`, `Qualified`, `Converted`, `Lost`
