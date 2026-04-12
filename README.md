# Employee Directory — HR Management System

A microservices-based Employee Directory app built with React + Java Spring Boot, deployed on Azure.

## Architecture

- **Frontend** — React (Vite) served via Azure App Service
- **Employee Service** — Java Spring Boot REST API (port 8081)
- **Department Service** — Java Spring Boot REST API (port 8082)
- **Database** — Azure SQL (SQL Server)
- **Secrets** — Azure Key Vault
- **Storage** — Azure Storage Account
- **CDN/HA** — Azure Front Door
- **IaC** — Terraform
- **CI/CD** — GitHub Actions

## Local Development

```bash
docker-compose up --build
```

Open http://localhost:3000

## Azure Deployment

### Step 1 — Terraform (run once)

```bash
cd terraform
terraform init
terraform apply -var="sql_admin_password=YourPassword123!"
```

### Step 2 — Get publish profiles from Azure Portal

For each App Service, go to Azure Portal → App Service → Download publish profile.

Add these as GitHub secrets:
- `EMPLOYEE_SERVICE_PUBLISH_PROFILE`
- `DEPARTMENT_SERVICE_PUBLISH_PROFILE`
- `FRONTEND_PUBLISH_PROFILE`

### Step 3 — Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/employee-directory.git
git push -u origin main
```

GitHub Actions will automatically deploy all services.

### Step 4 — Set Frontend Startup Command in Azure

Go to Azure Portal → `empdir-prod-frontend` → Configuration → Stack settings:

**Startup command:**
```
npx serve -s /home/site/wwwroot -l 8080
```

## API Endpoints

### Employee Service (port 8081)
- `GET /api/v1/employees` — list all
- `POST /api/v1/employees` — create
- `GET /api/v1/employees/{id}` — get by id
- `PUT /api/v1/employees/{id}` — update
- `DELETE /api/v1/employees/{id}` — deactivate
- `GET /api/v1/employees/department/{id}` — by department

### Department Service (port 8082)
- `GET /api/v1/departments` — list all
- `POST /api/v1/departments` — create
- `GET /api/v1/departments/{id}` — get by id
- `PUT /api/v1/departments/{id}` — update
