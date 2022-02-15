docker build -t msr-demo -f msr.dockerfile .\

docker run -dp 5556:5555 msr2:latest


docker-compose --project-name demo-msr-1 -f msr.compose.yml up -d