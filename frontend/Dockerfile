FROM nginx:alpine

# Kopiowanie prebudowanych plików statycznych
COPY build /usr/share/nginx/html

# Kopiowanie konfiguracji nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ekspozycja portu 80
EXPOSE 80

# Uruchomienie nginx
CMD ["nginx", "-g", "daemon off;"]
