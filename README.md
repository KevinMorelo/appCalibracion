# calc
cd calc && uvicorn main:app --reload --port 8000
# api
cd api && npm i && npx prisma generate && npx prisma migrate 
dev && npm run start:dev
