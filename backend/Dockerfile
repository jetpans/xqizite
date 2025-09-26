# Use a lightweight Python image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    FLASK_ENV=production

# Set working directory inside container
WORKDIR /app

# Install system dependencies (optional, only if needed for psycopg2, etc.)
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies early to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy rest of the application code
COPY . .

# Expose port (Flask default is 5000)
EXPOSE 5000

# Run with Gunicorn (recommended for production)
# -w 4 = 4 worker processes
# -b 0.0.0.0:5000 = bind to container port 5000
CMD ["gunicorn", "-w", "1" , "-k", "eventlet", "-b", "0.0.0.0:5000", "app:app"]