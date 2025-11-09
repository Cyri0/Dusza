FROM python:3.13.0

WORKDIR /

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

CMD ["gunicorn", "jatek.wsgi:application", "--bind", "0.0.0.0:8000"]
