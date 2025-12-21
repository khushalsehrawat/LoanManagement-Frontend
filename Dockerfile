FROM nginx:alpine

# Copy static files to nginx web root
COPY . /usr/share/nginx/html

#COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
