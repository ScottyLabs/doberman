# Doberman

Uptime Monitor for ScottyLabs

## Installation & Launch

1. Install [Docker](https://docs.docker.com/get-started/get-docker/); can check for successful installation with `docker --version` and `docker compose version`

(Note: If you install with Docker Engine (Linux), you should install Docker Compose as well.)

2. Clone the repository:
`git clone https://github.com/ScottyLabs/doberman.git`

3. Run Prometheus:

Option 1 - with `-d` flag (**recommended**)
```bash
docker-compose up -d
```
- Detached mode; starts containers in background
- Can still see all logs with commands below

Option 2 (for debugging/seeing live logs)
```bash
docker-compose up
```
- Starts containers in foreground
- Terminal is occupied; shows live logs from containers
- `Ctrl+C` to stop

Other useful commands
```bash
docker-compose up -d --build     # rebuild and run
docker-compose down              # stop all
docker-compose restart           # restart services

# logs
docker-compose ps                      # show currently running services
docker-compose logs                    # show all logs
docker-compose logs blackbox-exporter  # show logs for blackbox
docker-compose logs prometheus         # show logs for prometheus
```

Target for Prometheus is set to <http://localhost:9090/>. Go to Alerts panel on the top toolbar for alerts info, and Status > Target health panel for current endpoint statuses.

So far, there are two alerts: `WebsiteDown` (fires if website has been down for > 1 minute), and `WebsiteSlow` (fires if website takes > 5 seconds to respond). Note that <http://httpstat.us/503> is expected to be down, and <https://httpbin.org/delay/6.7> is expected to be slow. All other endpoints should be alive and kicking (metaphorically speaking).

## Note
Before running, make sure to create `data/prometheus/queries.active` inside of the root directory, otherwise Prometheus will fail. This is not the expected behavior, as Prometheus should bootstrap itself on first startup - not sure how to fix this, may have to do with chown nobody. See <https://github.com/prometheus/prometheus/issues/5976> for details.

## TODO
- fix the aforementioned problem
- make alertmanager - send to Slack/Discord/etc.
  - Each alert should ping no one/ping relevant people based on severity
- customize alerts - custom endpoints?
  - SSL expiry alerts
  - Performance degradation alerts
  - Track performance of prometheus itself as well
- :p
