from fastapi import FastAPI

app = FastAPI(
    title="Weather Dashboard API",
    description="Basic FastAPI foundation",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"status": "online", "message": "Backend ready!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}