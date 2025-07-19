
# Quakes Near Me

**Quakes Near Me** is a full-stack web application that visualizes real-time earthquake data on an interactive map and in a table. The app fetches the latest seismic activity every 10 minutes and displays it in a user-friendly interface.

**Live site:** https://quakesnearme.com

---

## Features

- **Interactive map and data table** of earthquakes
- **Automatic refresh every 10 minutes** (via Heroku Scheduler)
- **Data sources**:
  - [USGS Earthquake API](https://earthquake.usgs.gov/fdsnws/event/1/)
  - [EMSC Seismic Data](https://www.seismicportal.eu/)
- **Backend** with FastAPI + SQLAlchemy
- **PostgreSQL** for persistent storage
- **Frontend deployed via Netlify**
- **Backend deployed to Heroku**

---

## Tech Stack

- **Frontend:** React, Leaflet, Netlify
- **Backend:** FastAPI, SQLAlchemy, Heroku
- **Database:** PostgreSQL
- **Scheduler:** Heroku Scheduler (every 10 minutes)

---

## Development

### Backend (Heroku)

```bash
# Run fetch manually
python main.py fetch

# Serve FastAPI app (for development)
uvicorn main:app --reload
```

### Frontend (Netlify)

```bash
cd frontend
npm install
npm run dev
```

---

## Deployment

- **Heroku Scheduler runs:**  
  ```bash
  python main.py fetch
  ```
  every 10 minutes to keep the data fresh.

- **GeoJSON API endpoint:**  
  `/api/earthquakes.geojson`

- **Health check:**  
  `/api/health`

---

## Project Structure

```
├── backend/
│   ├── main.py                 # FastAPI app & fetch logic
│   ├── external_data/          # Fetch + process data from USGS & EMSC
│   └── earthquakes.geojson     # GeoJSON file (optional or temporary)
├── frontend/
│   └── ...                     # React + Leaflet frontend
├── quakes_near_me.db           # Local SQLite (optional)
└── README.md
```

---

## License

**MIT**
