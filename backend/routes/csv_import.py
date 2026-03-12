from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Lead
import csv
import io

router = APIRouter()

# Old upload csv file function which reads leads one by one and insert into db one by one
# @router.post("/upload-csv")
# async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
#     """Upload a CSV file containing lead data."""

#     content = await file.read()
#     decoded = content.decode("utf-8")
#     reader = csv.DictReader(io.StringIO(decoded))

#     leads_added = 0

#     for row in reader:
#         lead = Lead(
#             agent_name=row.get("Agent", ""),
#             source=row.get("Source", ""),
#             status=row.get("Status", ""),
#             revenue=float(row.get("Revenue", 0)),
#             created_at=row.get("CreatedAt")
#         )
#         db.add(lead)
#         leads_added += 1

#     db.commit()

#     return {"message": f"Successfully uploaded {leads_added} leads"}


BATCH_SIZE = 5000

# instead of reading and writing one by one make a batch of fixed number of leads which devides the record into parts
@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload a CSV file containing lead data."""

    leads_added = 0
    batch = []

    # Stream file instead of loading entire content
    stream = io.TextIOWrapper(file.file, encoding="utf-8")
    reader = csv.DictReader(stream)

    for row in reader:
        batch.append({
            "agent_name": row.get("Agent", ""),
            "source": row.get("Source", ""),
            "status": row.get("Status", ""),
            "revenue": float(row.get("Revenue", 0) or 0),
            "created_at": row.get("CreatedAt"),
        })

        if len(batch) >= BATCH_SIZE:
            db.bulk_insert_mappings(Lead, batch)
            db.commit()

            leads_added += len(batch)
            batch.clear()

    # Insert remaining rows
    if batch:
        db.bulk_insert_mappings(Lead, batch)
        db.commit()
        leads_added += len(batch)

    return {"message": f"Successfully uploaded {leads_added} leads"}


@router.post("/upload-csv-batch")
async def upload_csv_batch(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Batch upload with error handling for individual rows."""

    content = await file.read()
    decoded = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))

    leads_added = 0
    errors = []

    for row in reader:
        try:
            lead = Lead(
                agent_name=row.get("Agent", ""),
                source=row.get("Source", ""),
                status=row.get("Status", ""),
                revenue=float(row.get("Revenue", 0)),
                created_at=row.get("CreatedAt")
            )
            db.add(lead)
            db.commit()
            leads_added += 1
        except Exception as e:
            errors.append(str(e))
            db.rollback()

    return {"message": f"Uploaded {leads_added} leads", "errors": errors}
