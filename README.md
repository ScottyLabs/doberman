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
docker-compose ps                         # show currently running services
docker-compose logs                       # show all logs
docker-compose logs <container_name>      # show logs for specific container
docker inspect network <network_name>     # shows containers on network
```

Target for Prometheus is set to <http://localhost:9090/>. Go to Alerts panel on the top toolbar for alerts info, and Status > Target health panel for current endpoint statuses.

Target for Grafana is <http://localhost:3000/>. Go to Dashboards > Prometheus Blackbox Exporter in the left menu for the main dashboard, > Prometheus 2.0 Stats for Prometheus metrics.

Currently, there are four alerts: `WebsiteDown` (fires if website has been down for > 1 minute), `WebsiteSlow` (fires if website takes > 5 seconds to respond),`SSLCertExpirySoon` (fires if SSL certificate is < 1 week from expiring), `WebsitePerformanceDegradation` (fires if website is taking longer and longer to respond over past 5 mintes). Note that <http://httpstat.us/503> is expected to be down, and <https://httpbin.org/delay/6.7> is expected to be slow. All other endpoints should be alive and kicking (metaphorically speaking).

## Note
Before running, make sure to create `data/prometheus/queries.active` inside of the root directory, otherwise Prometheus will fail. This is not the expected behavior, as Prometheus should bootstrap itself on first startup - not sure how to fix this, may have to do with chown nobody. See <https://github.com/prometheus/prometheus/issues/5976> for details.

## TODO
- [ ] Fix the aforementioned problem (might not need to fix anymore - could just init on VM and leave running)
- [ ] Make alertmanager - send to Slack/Discord/etc.
  - [ ] Also make sure alerts are actually reaching Grafana
  - [ ] Each alert should ping no one/ping relevant people based on severity
- [ ] Fix alerts timeline short-term weird chunks (only on Jason's setup? someone else should check)
- [ ] Custom endpoints - work with other teams
- [ ] Github
  - [ ] Update permissions to only allow pull requests
  - [ ] Add staging branch
- [ ] Once VMs are available, host prometheus on VMs - figure out how
- [ ] Before deployment, increase the interval between scrapes
- [ ] Figure out how to make every alert show up on Grafana
- [ ] Probably should refine the layout of the dashboard as well
- [x] Customize alerts
  - [x] SSL expiry alert
  - [x] Performance degradation alert
  - [x] Track performance of prometheus itself as well
- [x] :p
