FROM python:3.11.9
RUN mkdir /app
WORKDIR /app
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY main.py .
CMD ["python", "main.py"]