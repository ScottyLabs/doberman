# Doberman

Uptime Monitor for ScottyLabs

## Launch

Install [Docker](https://docs.docker.com/get-started/get-docker/) first; can check for successful installation with `docker --version`

```bash
# run/stop
docker-compose up -d    # run
docker-compose down     # stop

# debugging
docker-compose logs                    # show all logs
docker-compose logs blackbox-exporter  # show logs for blackbox
docker-compose logs prometheus         # show logs for prometheus
```

Target for Prometheus is set to <http://localhost:9090/>. Go to Alerts panel on the top toolbar for alerts info, and Status > Target health panel for current endpoint statuses.

So far, there are two alerts: WebsiteDown (fires if website has been down for > 1 minute), and WebsiteSlow (fires if website takes > 5 seconds to respond). Note that <http://httpstat.us/503> is expected to be down.

## Note
Before running, make sure to create `data/prometheus/queries.active` inside of the root directory, otherwise Prometheus will fail. This is not the expected behavior, as Prometheus should bootstrap itself on first startup - not sure how to fix this, may have to do with chown nobody. See <https://github.com/prometheus/prometheus/issues/5976> for details.

## TODO
- fix the aforementioned problem
- make alertmanager
- customize alerts
- figure out Grafana
- :p
