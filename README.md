# weather-dashboard

> **Status:** 🚧 Under Active Development

A modern web application designed to monitor real-time weather conditions. This project combines a modular Angular frontend with a high-performance Python (FastAPI) backend. 

### Running the Backend

Copy and run the following commands in your terminal to set up and start the FastAPI backend:

```bash
# 1. Navigate into the backend directory
cd backend

# 2. Create a local virtual environment (.venv) to isolate Python packages
python3 -m venv .venv

# 3. Activate the virtual environment
source .venv/bin/activate

# 4. Install the required dependencies (FastAPI, Uvicorn) from requirements.txt
pip install -r requirements.txt

# 5. Start the development server with auto-reload enabled
uvicorn app.main:app --reload
```


### Running the Frontend

```bash
#1 Install Angular CLI globally (if not already installed)
npm install -g @angular/cli@22

#2 Navigate to the frontend directory
cd frontend

#3 Install project dependencies
npm install

#4 Start the frontend locally
ng serve