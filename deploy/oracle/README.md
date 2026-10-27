# Oracle Cloud Always Free — the zero-cost, always-on option

Oracle gives **2 OCPU / 12 GB RAM / 200 GB storage** on an Ampere A1 ARM VM,
free forever, in the **Mumbai or Hyderabad** home region. That is enough for the
Spring Boot backend, the FastAPI service, MySQL and Caddy on one machine — no
cold starts and ~10–30 ms from India.

Trade-offs: a card is required for identity verification (Always Free resources
are not charged), ARM capacity is often exhausted, and you own the server.

## 1. Create the account and VM

1. Sign up at <https://www.oracle.com/cloud/free/>. Choose **India West (Mumbai)**
   or **India South (Hyderabad)** as the home region — it cannot be changed.
2. Create a VCN with the **VCN with Internet Connectivity** wizard (public subnet).
3. Create an instance:
   - Shape: **VM.Standard.A1.Flex**
   - **2 OCPU, 12 GB RAM** (the whole Always Free allowance)
   - Image: Ubuntu 24.04
   - Boot volume: 100 GB
   - Assign a public IPv4 address
4. If you see **"Out of host capacity"**, retry later or use Hyderabad. This is
   the most common failure mode; there is no paid workaround that stays free.
5. Security list ingress:
   - TCP 22 from your IP only
   - TCP 80 and 443 from `0.0.0.0/0`

## 2. Prepare the server

```bash
ssh ubuntu@YOUR_PUBLIC_IP

sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# log out and back in so the docker group applies

sudo ufw allow 22,80,443/tcp
```

## 3. Configure and start the stack

```bash
git clone https://github.com/YOUR_ORG/AI-Interviewer.git
cd AI-Interviewer

cp deploy/free.env.example .env
nano .env
```

Set in `.env`:

- `APP_DOMAIN`: a real domain pointed at the VM, or an sslip.io name derived
  from the IP (`203.0.113.10` → `203-0-113-10.sslip.io`). Caddy obtains a
  Let's Encrypt certificate automatically; ports 80/443 must be reachable.
- `DB_PASSWORD`, `DB_ROOT_PASSWORD`
- `JWT_SECRET` (`openssl rand -base64 48`)
- `AI_SERVICE_TOKEN` (`openssl rand -hex 32`)
- `LLM_API_KEY` and `LLM_MODEL=gemini-3.5-flash-lite`

Then:

```bash
docker compose -f docker-compose.free.yml up -d --build
docker compose -f docker-compose.free.yml ps
```

The first build takes 5–10 minutes (Maven + npm). When Caddy has the
certificate:

```bash
curl https://YOUR_DOMAIN/api/health
# {"status":"UP","database":"UP","aiService":"UP"}
```

Open `https://YOUR_DOMAIN` and register. The frontend is served by Caddy from
the same origin, so there is no CORS configuration.

## 4. Operations

```bash
# logs
docker compose -f docker-compose.free.yml logs -f backend
docker compose -f docker-compose.free.yml logs -f ai

# update after a git push
git pull
docker compose -f docker-compose.free.yml up -d --build

# backup (add to cron)
docker compose -f docker-compose.free.yml exec -T db \
  mysqldump -u interviewer -p"$DB_PASSWORD" ai_interviewer | gzip \
  > ~/backup-$(date +%F).sql.gz
```

- MySQL data: Docker volume `ai-interviewer-free_db_data`.
- Resume uploads: volume `ai-interviewer-free_uploads` (parsed text is also in
  MySQL).
- Memory: backend `-Xmx768m`, MySQL buffer pool 256 MB; 12 GB is comfortable.
- Caddy data (certificates) lives in `caddy_data`.

## 5. If you do not own a domain

`sslip.io` resolves any `a-b-c-d.sslip.io` to `a.b.c.d`, and Caddy can get a
normal Let's Encrypt certificate for it. The URL is ugly but HTTPS works. Do
not put Cloudflare's orange-cloud proxy in front of Caddy on first issuance;
keep the DNS record grey until the certificate is issued, or use a Cloudflare
Origin Certificate and Full (strict) mode.

## 6. When this is not the best fit

- Capacity unavailable and you do not want to retry: use **Northflank Sandbox**
  (`deploy/northflank/README.md`) — zero ops, but a $20/month resource cap and
  no India region.
- You need a managed SLA, backups and zero server maintenance: the paid managed
  stack in `DEPLOY.md` (Railway + Cloudflare Pages + TiDB).
