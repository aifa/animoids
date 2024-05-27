# Use an official Python runtime as a parent image
FROM python:3.12-slim

WORKDIR /app

# Install any needed packages specified in requirements.txt
#RUN pip install --no-cache-dir -r requirements.txt

COPY . /app
# Run the script when the container launches
CMD ["python", "/app/hello.py"]  # Replace with your script name and IPFS link if static, or handle args in entrypoint
