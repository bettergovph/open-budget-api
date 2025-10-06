# BetterGovPH Open Budget API

A comprehensive REST API for Philippine Government Budget Data (NEP/GAA 2020-2026) built on a Neo4j graph database with full UACS dimension linking and hierarchical relationships.

## 🎯 Project Overview

A production-ready, open-source API for Philippine government budget transparency built with NestJS, Neo4j, and TypeScript. This API provides programmatic access to **6.8+ million budget records** totaling **₱106.9 trillion** with comprehensive filtering, aggregation, year-over-year comparisons, and hierarchical analytics.

### Key Features

- ✅ **Complete Budget Data**: NEP/GAA records from 2020-2026
- ✅ **Hierarchical Structures**: Full organizational and expense classification hierarchies
- ✅ **NEP vs GAA Comparisons**: Built-in comparison analytics
- ✅ **Geographic Coverage**: Regional, provincial, and municipal breakdowns
- ✅ **UACS Compliant**: Following Unified Accounts Code Structure standards
- ✅ **Graph Database**: Complex relationship queries via Neo4j
- ✅ **REST API**: Clean, well-documented endpoints
- ✅ **TypeScript**: Full type safety and IDE support

## 🚀 Quick Start (with Docker)

This project includes a fully automated setup using Docker and a custom import script, which is the recommended way to get started.

### Prerequisites

- **Docker** & **Docker Compose**
- **Node.js** 20+
- **Yarn** package manager
- **Bash** (for the import script)

### 1. Clone and Configure

```bash
# Clone the repository
git clone https://github.com/bettergovph/open-budget-api.git
cd open-budget-api

# Create your environment file
cp .env.example .env
# The default .env values are pre-configured for the Docker setup.
```

### 2. Start Database & Import Data

This step will start a Neo4j container and then populate it with over 6.8 million budget records.

```bash
# Start the Neo4j database in the background
docker-compose up -d

# Make the import script executable
chmod +x import-budget-data.sh

# Run the import script
# This will clone the data repository, convert files, and load them into Neo4j.
# Note: This process will take several minutes to complete.
./import-budget-data.sh
```

### 3. Run the Application

Once the data import is complete, you can start the API server.

```bash
# Development mode (with hot reload)
yarn start:dev
```

### Access the API

- **API Base URL**: `http://localhost:3000/api/v1`
- **Swagger Documentation**: `http://localhost:3000/api/docs`
- **Health Check**: `http://localhost:3000/api/v1/health`

## 📚 API Endpoints

### Budget Summary & Analytics

| Endpoint                               | Description                                                   |
| -------------------------------------- | ------------------------------------------------------------- |
| `GET /api/v1/budget/summary`           | Comprehensive budget overview with year-over-year comparisons |
| `GET /api/v1/budget/total`             | Total budget amount with optional filters                     |
| `GET /api/v1/budget/by-department`     | Budget aggregated by department                               |
| `GET /api/v1/budget/by-department-all` | All departments with NEP/GAA comparison                       |
| `GET /api/v1/budget/compare-nep-gaa`   | Compare NEP vs GAA budgets                                    |
| `GET /api/v1/budget/records-mapped`    | Paginated budget records with full UACS mappings              |

### Departments

| Endpoint                        | Description                                                 |
| ------------------------------- | ----------------------------------------------------------- |
| `GET /api/v1/departments`       | List all departments with optional budget data              |
| `GET /api/v1/departments/:code` | Detailed department information with hierarchical breakdown |

### Regions

| Endpoint                    | Description                                       |
| --------------------------- | ------------------------------------------------- |
| `GET /api/v1/regions`       | List all regions with optional budget allocations |
| `GET /api/v1/regions/:code` | Detailed regional budget breakdown                |

### Expense Classifications

| Endpoint                                | Description                                                                       |
| --------------------------------------- | --------------------------------------------------------------------------------- |
| `GET /api/v1/expense-categories`        | Hierarchical expense classifications (Classification → SubClass → Group → Object) |
| `GET /api/v1/expense-categories/budget` | Budget breakdown by expense category with top sub-objects                         |

### Funding Sources

| Endpoint                            | Description                         |
| ----------------------------------- | ----------------------------------- |
| `GET /api/v1/funding-sources`       | List all funding sources            |
| `GET /api/v1/funding-sources/:code` | Detailed funding source information |

### Organizations

| Endpoint                              | Description                           |
| ------------------------------------- | ------------------------------------- |
| `GET /api/v1/organizations`           | Search and list organizations         |
| `GET /api/v1/organizations/:uacsCode` | Organization details with budget data |

### Locations

| Endpoint                          | Description                    |
| --------------------------------- | ------------------------------ |
| `GET /api/v1/locations/provinces` | List all provinces             |
| `GET /api/v1/locations/cities`    | List all cities/municipalities |
| `GET /api/v1/locations/barangays` | List all barangays             |

### Health & Monitoring

| Endpoint                      | Description                                      |
| ----------------------------- | ------------------------------------------------ |
| `GET /api/v1/health`          | Basic health check                               |
| `GET /api/v1/health/detailed` | Detailed health check with database connectivity |

> **Complete API Documentation**: Available at `http://localhost:3000/api/docs` (Swagger UI)

## 🔧 Configuration

Environment variables (`.env`):

```env
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Neo4j Configuration
NEO4J_URI=neo4j://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password

# App Configuration
CORS_ORIGIN=*
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=debug
```

## 📁 Project Structure

```
open-budget-api/
├── src/
│   ├── config/                    # Configuration files
│   ├── database/
│   │   └── neo4j/                # Neo4j database module
│   ├── modules/
│   │   ├── budget/               # Budget summary & analytics endpoints
│   │   ├── departments/          # Department endpoints & hierarchies
│   │   ├── regions/              # Regional allocation endpoints
│   │   ├── expense-categories/   # Expense classification endpoints
│   │   ├── funding-sources/      # Funding source endpoints
│   │   ├── organizations/        # Organization search & details
│   │   ├── locations/            # Geographic location endpoints
│   │   └── health/               # Health check endpoints
│   ├── common/                   # Shared utilities
│   │   ├── dto/                  # Data Transfer Objects
│   │   ├── filters/              # Exception filters
│   │   └── interceptors/         # Request/Response interceptors
│   ├── app.module.ts             # Root application module
│   └── main.ts                   # Application entry point
├── FRONTEND_INTEGRATION.md       # Frontend integration guide
├── FRONTEND_IMPLEMENTATION_GUIDE.md  # Complete implementation guide
└── README.md                      # This file
```

## 🧪 Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov
```

## 📖 API Examples

### Get Budget Summary (Year-over-Year)

```bash
curl "http://localhost:3000/api/v1/budget/summary?year=2025"
```

Returns comprehensive budget overview with selected year, previous year, and next year comparisons including NEP/GAA totals, growth rates, and statistics.

### Get Budget Total

```bash
curl "http://localhost:3000/api/v1/budget/total?year=2025&type=GAA"
```

### Get Budget by Department

```bash
curl "http://localhost:3000/api/v1/budget/by-department?year=2025&type=NEP&limit=10"
```

### Get All Departments with NEP/GAA Comparison

```bash
curl "http://localhost:3000/api/v1/budget/by-department-all?year=2025&includeNepGaa=true"
```

### Get Department Details with Hierarchical Breakdown

```bash
# Basic department info
curl "http://localhost:3000/api/v1/departments/07"

# With full budget breakdown (agencies, operating unit classes, expense classifications, projects)
curl "http://localhost:3000/api/v1/departments/07?year=2025"
```

### Get Expense Classifications Hierarchy

```bash
# Basic classification list
curl "http://localhost:3000/api/v1/expense-categories"

# Full hierarchy with NEP/GAA budgets (Classification → SubClass → Group → Object)
curl "http://localhost:3000/api/v1/expense-categories?year=2025"
```

### Get Budget Records with UACS Mappings

```bash
curl "http://localhost:3000/api/v1/budget/records-mapped?year=2025&type=GAA&page=1&limit=50"
```

## 🔐 Security Features

- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Rate limiting (100 requests/minute)
- ✅ Input validation
- ✅ Request compression

## 🎨 Tech Stack

- **Framework**: NestJS
- **Database**: Neo4j
- **Language**: TypeScript
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, Rate Limiting
- **Validation**: class-validator

## 📊 Data Source

This API serves budget data processed and published through the **[BetterGovPH Open Budget Data](https://github.com/bettergovph/open-budget-data)** repository. The data originates from the Philippine Department of Budget and Management (DBM) and has been structured into a Neo4j graph database for comprehensive analysis.

### Data Coverage

- **Budget Types**: NEP (National Expenditure Program) and GAA (General Appropriations Act)
- **Fiscal Years**: 2020-2026
- **Total Records**: 6.8+ million budget records
- **Total Budget**: ₱106.9 trillion across all years
- **Dimensions**: Full UACS (Unified Accounts Code Structure) hierarchy

### Data Structure

The [open-budget-data](https://github.com/bettergovph/open-budget-data) repository contains:

- Raw budget data files (NEP/GAA CSV files)
- Neo4j import scripts for graph database creation
- UACS dimension mappings (departments, agencies, expense classifications, etc.)
- Data validation and processing tools

### Setting Up the Database (Automated)

The process of setting up the Neo4j database and importing the data is **fully automated**.

The `docker-compose.yml` file starts a pre-configured Neo4j instance, and the `import-budget-data.sh` script handles the entire data pipeline, from cloning the source data to populating the database.

**Please follow the instructions in the [🚀 Quick Start](#-quick-start-with-docker) section for a one-time, automated setup.**

## 🛣️ Roadmap

This project is part of a larger initiative to create **Open APIs for all Philippine government datasets**.

For the complete development roadmap, future Open API projects, and our vision for government data transparency, see **[PLAN.md](PLAN.md)**.

### Current Status

✅ **Open Budget API**:
comprehensive endpoints for budget data analysis

### Upcoming Projects

**Learn More**: See [PLAN.md](PLAN.md) for detailed timelines, planned features, and how to get involved.

## 📝 License

MIT License - This project is open source and freely available for use, modification, and distribution.

## 🤝 Contributing

Contributions are welcome and encouraged! This is an open government data project that benefits from community involvement.

**Quick Start**:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**For detailed contribution guidelines, development workflow, code style, and testing requirements, please see [CONTRIBUTING.md](CONTRIBUTING.md).**

**Areas for Contribution**:

- API endpoint enhancements
- Performance optimizations
- Documentation improvements
- Test coverage
- Bug fixes
- Frontend integration examples
- Data quality validation

## 📞 Contact & Resources

- **Project**: BetterGovPH - Open Government Data Initiative
- **API Version**: 1.0.0
- **Data Repository**: [open-budget-data](https://github.com/bettergovph/open-budget-data)
- **API Repository**: [open-budget-api](https://github.com/bettergovph/open-budget-api)
- **Issues**: Report bugs or request features via GitHub Issues

## 🌟 Related Projects & Documentation

- **[open-budget-data](https://github.com/bettergovph/open-budget-data)**: Source data and Neo4j import scripts
- **[PLAN.md](PLAN.md)**: Complete roadmap and vision for Open APIs across all government datasets
- **[CONTRIBUTING.md](CONTRIBUTING.md)**: Contribution guidelines, development workflow, and code standards
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)**: Community standards and behavior expectations

---

**Built with ❤️ for Philippine Government Budget Transparency**
