FROM python:3.11.9

# Set working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY ./backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code into /app/backend
COPY ./backend /app/backend

ENV PYTHONPATH=/app/backend

# Expose the correct port for the FastAPI app
EXPOSE 8000

# Ensure that the database file is created in a persistent storage
VOLUME ["/app/data"]

# Start the FastAPI server
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
