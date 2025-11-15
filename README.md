# Doberman

Uptime Monitor for ScottyLabs

## Launch

Run Prometheus:
```bash
podman-compose up -d
```
- Flag `-d`: detached mode; starts containers in background

Other useful commands:
```bash
podman-compose up -d --build     # rebuild and run
podman-compose down              # stop all (declared in current podman-compose.yml)
podman-compose restart           # restart services

# logs
podman-compose ps                         # show currently running services
podman-compose logs                       # show all logs
podman-compose logs <container_name>      # show logs for specific container
podman inspect network <network_name>     # show containers on network
```

Target for Grafana is `http://<VM_IP>:3001/`. (The VM's IP address can be obtained via running `hostname -I` on the VM.) Go to Dashboards > Prometheus Blackbox Exporter in the left menu for the main dashboard, > Prometheus 2.0 Stats for Prometheus metrics.

Currently, there are four alerts: `WebsiteDown` (fires if website has been down for > 1 minute), `WebsiteSlow` (fires if website takes > 5 seconds to respond),`SSLCertExpirySoon` (fires if SSL certificate is < 1 week from expiring), `WebsitePerformanceDegradation` (fires if website response time continues to increase over 5 minutes). Alertmanager should be working.

Previous test endpoints (currently unused): <http://httpstat.us/503> is expected to be down, and <https://httpbin.org/delay/6.7> is expected to be slow.

## Note
- This is the branch configured for VM deployment. Note that podman is equivalent to docker (for our use case).

- If deploying for the first time (or after a clean reset), run the following commands to set up the Prometheus data folder:
```bash
mkdir -p data/prometheus
sudo chown -R 65534:65534 data    # assigns ownership to nobody
sudo chmod -R 777 data            # makes directory world-writable
```

## TODO

### General stuff
- [ ] Test alertmanager again, make sure it works on VM
- [ ] Make dashboard prettier (as needed)
- [ ] Synthetic monitoring - see Slack for details (agent to intelligently detect issues/check core functionality). Playwright equivalent in Grafana = [k6 browser check](https://grafana.com/docs/grafana-cloud/testing/synthetic-monitoring/create-checks/checks/k6-browser/).

### VM stuff
- [x] Deploy to VM
  - [x] Set up data folder
  - [x] Increase interval between scrapes

### Done
- [x] Fix alerts timeline short-term weird chunks (only on Jason's setup? someone else should check)
- [x] Make alertmanager - send to Slack/Discord/etc.
  - [x] Also make sure alerts are actually reaching Grafana
- [x] Figure out how to make every alert show up on Grafana
- [x] Update this README for VM info
- [x] Github
  - [x] Update permissions to only allow pull requests
- [x] Customize alerts
  - [x] SSL expiry alert
  - [x] Performance degradation alert
  - [x] Track performance of prometheus itself as well
- [x] :p
