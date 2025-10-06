# 🛣️ Open Budget API - Development Roadmap

> **⚠️ DRAFT STATUS**: This is an initial plan and subject to change. The architecture, timelines, and features outlined here are preliminary and will evolve based on community feedback, technical feasibility, and resource availability.

This document outlines the development roadmap for the Open Budget API and the broader vision for creating comprehensive Open APIs for all Philippine government datasets.

## 📊 Current Project: Open Budget API

### ✅ Completed Features

- **Core API Structure**: NestJS-based REST API with Swagger documentation
- **Budget Endpoints**: Summary, totals, department aggregations, NEP/GAA comparisons
- **Department Analytics**: Hierarchical breakdown with agencies, operating unit classes, expense classifications, and projects
- **Expense Categories**: Full classification hierarchy with NEP/GAA budgets
- **Regional Data**: Regional and provincial budget allocations
- **Organizations**: Organization search and details
- **Locations**: Province, city, and barangay listings
- **Funding Sources**: Funding source information
- **Health Monitoring**: Database connectivity checks
- **UACS Mappings**: Complete budget records with all UACS dimensions
- **Frontend Integration Guide**: Comprehensive documentation for building applications

### 🚧 In Progress

- Comprehensive test coverage (unit and E2E tests)
- Performance optimization and caching strategies
- Enhanced search functionality across all dimensions

### 📋 Planned Features for Open Budget API

#### Phase 1: Enhanced Analytics (Q2 2025)
- **Time-Series Analysis**: Multi-year budget trends and growth patterns
- **Variance Analytics**: NEP vs GAA comparison analytics
- **Department Comparisons**: Cross-department budget allocation analysis
- **Project Tracking**: Multi-year project budget tracking

#### Phase 2: Performance & Scalability (Q3 2025)
- **Caching Layer**: Redis caching for frequently accessed data
- **Query Optimization**: Optimized Cypher queries for large datasets
- **Rate Limiting**: Advanced rate limiting and quota management
- **CDN Integration**: Static response caching via CDN

#### Phase 3: Advanced Features (Q4 2025)
- **GraphQL API**: Optional GraphQL endpoint alongside REST
- **Data Export**: CSV/Excel/JSON export functionality for all endpoints
- **Real-time Updates**: WebSocket support for live budget data updates
- **Advanced Search**: Full-text search across all dimensions
- **Data Visualization Endpoints**: Pre-calculated chart data endpoints

#### Phase 4: Developer Experience (Q1 2026)
- **API Client Libraries**: TypeScript/JavaScript SDK for easier integration
- **Python SDK**: Python client library for data science and research
- **OpenAPI Code Generation**: Auto-generated clients for multiple languages
- **Interactive API Playground**: Enhanced Swagger UI with examples and tutorials
- **Webhooks**: Event-driven notifications for budget updates

## 🌐 Vision: Open APIs for All Government Datasets

### Mission Statement

The Open Budget API is the **first step** in a broader initiative to create comprehensive, freely accessible APIs for **all Philippine government datasets**. Our goal is to democratize access to government data and empower developers, researchers, journalists, and citizens to build transparency applications.

### 🎯 Planned Open APIs

#### 1. **Open Education API** (Planned 2025)
- School data (locations, enrollment, facilities)
- Teacher information (ratios, qualifications)
- Educational outcomes (test scores, graduation rates)
- Budget allocations per school/district
- Scholarship and financial aid data

**Data Sources**: DepEd, CHED, TESDA datasets

#### 2. **Open Health API** (Planned 2025)
- Hospital and health facility information
- Disease surveillance and health statistics
- Vaccination records and programs
- PhilHealth data and claims
- Healthcare budget allocations

**Data Sources**: DOH, PhilHealth, Philippine Statistics Authority

#### 3. **Open Procurement API** (Planned 2026)
- Government procurement notices and awards
- Bid data and winning contractors
- Contract performance and compliance
- Procurement budget vs actual spending
- Supplier information and track records

**Data Sources**: PhilGEPS, DBM procurement data

#### 4. **Open Infrastructure API** (Planned 2026)
- Public infrastructure projects (roads, bridges, buildings)
- Project timelines and completion status
- Infrastructure budgets and expenditures
- Contractor information and performance
- Geographic mapping of infrastructure

**Data Sources**: DPWH, various government agencies

#### 5. **Open Social Services API** (Planned 2026)
- Social welfare programs (4Ps, AICS, etc.)
- Beneficiary statistics (anonymized)
- Program budgets and disbursements
- Service coverage by region/province
- Program effectiveness metrics

**Data Sources**: DSWD, various social service agencies

#### 6. **Open Environmental API** (Planned 2027)
- Air and water quality monitoring
- Environmental compliance and violations
- Protected areas and biodiversity data
- Climate data and weather patterns
- Environmental impact assessments

**Data Sources**: DENR, PAGASA, EMB

#### 7. **Open Justice API** (Planned 2027)
- Court case statistics and trends
- Crime data and statistics
- Law enforcement data
- Prosecution and conviction rates
- Legal aid and public attorney data

**Data Sources**: Supreme Court, DOJ, PNP, DILG

#### 8. **Open Agriculture API** (Planned 2027)
- Agricultural production data
- Crop prices and market information
- Farmer and fisherfolk registries
- Agricultural subsidies and support programs
- Food security indicators

**Data Sources**: DA, PSA, NFA

### 🏗️ Technical Architecture for Open APIs Platform

> **Note**: This architecture is **preliminary and under active development**. The structure will be refined as we gain experience with the Open Budget API and evaluate different technical approaches.

#### Current Architecture (Open Budget API)

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                      │
│         (Web, Mobile, Research Tools, Analytics)             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   NestJS REST API Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Budget     │  │  Departments │  │   Expense    │  ...  │
│  │   Module     │  │    Module    │  │  Categories  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Neo4j Service (Query Layer)                  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                Neo4j Graph Database                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Nodes: Department, Agency, BudgetRecord, etc.       │   │
│  │  Relationships: HAS_AGENCY, ALLOCATED_TO, etc.       │   │
│  │  ~6.8M budget records, ₱106.9T across all years      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### Proposed Future Architecture (Multi-API Platform)

> **⚠️ SUBJECT TO CHANGE**: This is a preliminary vision. Actual implementation may differ significantly based on:
> - Technical evaluation and proof-of-concepts
> - Scalability and performance testing
> - Community feedback and contributions
> - Resource availability and priorities
> - Government agency partnerships and data availability

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Client Applications                                 │
│     (Web Dashboards, Mobile Apps, Research Tools, Journalism Platforms)      │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        API Gateway (Future)                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐                │
│  │ Authentication │  │ Rate Limiting  │  │    Routing     │                 │
│  │   (OAuth 2.0)  │  │   & Quotas     │  │   & Load Bal.  │                 │
│  └────────────────┘  └────────────────┘  └────────────────┘                │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
                 ▼               ▼               ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Open Budget API │  │ Open Education   │  │  Open Health     │  ...
│   (Production)   │  │  API (Planned)   │  │  API (Planned)   │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                      │
         └─────────────────────┼──────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                  Shared Data Infrastructure (Future)                         │
│  ┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐    │
│  │   Neo4j Graph DB   │  │   PostgreSQL       │  │   Redis Cache      │    │
│  │   (Relationships)  │  │   (Structured)     │  │   (Performance)    │    │
│  └────────────────────┘  └────────────────────┘  └────────────────────┘    │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │          Elasticsearch / Full-Text Search (Future)                 │     │
│  └────────────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Architecture Principles

**Current Implementation**:
- ✅ **Modularity**: Each domain (budget, departments, etc.) is a separate NestJS module
- ✅ **Graph Database**: Neo4j for complex relational queries across hierarchical government data
- ✅ **RESTful Design**: Standard REST endpoints with Swagger documentation
- ✅ **Type Safety**: Full TypeScript implementation
- ✅ **Health Monitoring**: Database connectivity checks

**Future Considerations** (Not Yet Decided):

1. **Shared Infrastructure**
   - **Common API Gateway**: Unified authentication, rate limiting, and routing
     - *Status*: Under evaluation - considering Kong, AWS API Gateway, or custom NestJS gateway
   - **Centralized Documentation**: Single portal for all Open APIs
     - *Status*: Exploring options - unified Swagger UI, custom docs portal, or Stoplight
   - **Database Strategy**:
     - *Current*: Neo4j for graph relationships
     - *Future Options*: Hybrid approach (Neo4j + PostgreSQL), or evaluate other graph databases
   - **Common SDK**: Unified client libraries for all APIs
     - *Status*: To be designed after API patterns stabilize
   - **Unified Monitoring**: Centralized logging, metrics, and alerting
     - *Status*: Evaluating Prometheus + Grafana, ELK stack, or cloud-native solutions

2. **API Standards** (Draft - Open for Feedback)
   - **Consistent REST Design**: Standardized endpoint patterns across all APIs
     - *Example*: `/api/v1/{domain}/{resource}` pattern
   - **Unified Error Handling**: Common error response formats
     - *Draft Format*:
       ```json
       {
         "statusCode": 400,
         "message": "Validation failed",
         "error": "Bad Request",
         "timestamp": "2025-01-15T10:30:00Z",
         "path": "/api/v1/budget/summary"
       }
       ```
   - **Standard Authentication**: OAuth 2.0 / API key management
     - *Status*: Currently no authentication, planning for future
   - **Versioning Strategy**: Semantic versioning for all APIs
     - *Current*: `/api/v1/` prefix
   - **Rate Limiting**: Consistent rate limit policies
     - *Draft*: 1000 requests/hour for anonymous, higher limits for registered users

3. **Data Quality Standards** (In Development)
   - **Data Validation**: Automated quality checks for all datasets
     - *Current*: Manual validation, exploring automated tools
   - **Update Frequency**: Defined SLAs for data freshness
     - *Target*: Within 24 hours of government source updates
   - **Historical Data**: Time-series support for all datasets
     - *Current*: Multi-year budget data (2020-2026)
   - **Data Provenance**: Clear tracking of data sources and updates
     - *Status*: Documenting in open-budget-data repo
   - **Change Logs**: Transparent tracking of data changes
     - *Status*: To be implemented

#### Technology Stack

**Current Stack** (Open Budget API):
- **Backend Framework**: NestJS (Node.js, TypeScript)
- **Database**: Neo4j 5.x (Graph Database)
- **API Documentation**: Swagger/OpenAPI 3.0
- **Validation**: class-validator, class-transformer
- **Security**: Helmet.js, CORS
- **Testing**: Jest (unit and E2E)

**Potential Future Technologies** (Under Evaluation):
- **Caching**: Redis, Memcached, or built-in NestJS cache
- **Search**: Elasticsearch or Meilisearch for full-text search
- **Message Queue**: RabbitMQ, Kafka, or AWS SQS for async processing
- **API Gateway**: Kong, AWS API Gateway, or Traefik
- **Monitoring**: Prometheus + Grafana, ELK stack, or DataDog
- **CDN**: Cloudflare, AWS CloudFront, or similar
- **Container Orchestration**: Docker + Kubernetes (for scalability)

#### Design Decisions & Open Questions

**Decided**:
- ✅ Neo4j for hierarchical government data (excellent for complex relationships)
- ✅ NestJS for modular, testable API architecture
- ✅ TypeScript for type safety and developer experience
- ✅ Swagger for API documentation

**Under Evaluation**:
- ❓ **Single vs. Multiple Repositories**: Should each Open API be a separate repo or monorepo?
- ❓ **Database Strategy**: Continue Neo4j-only, or hybrid with PostgreSQL for some datasets?
- ❓ **Authentication**: OAuth 2.0 vs. API keys vs. JWT? When to implement?
- ❓ **Caching Strategy**: In-memory, Redis, CDN, or combination?
- ❓ **GraphQL**: Add GraphQL alongside REST, or REST-only?
- ❓ **Deployment**: Self-hosted, cloud (AWS/Azure/GCP), or hybrid?

**Community Input Needed**:
- 💬 What authentication method would work best for your use case?
- 💬 Should we prioritize GraphQL or focus on REST?
- 💬 What export formats are most important (CSV, Excel, JSON, Parquet)?
- 💬 What analytics features would be most valuable?

#### Scalability Considerations

**Current Scale**:
- 6.8M+ budget records
- ₱106.9T total budget data
- Handles ~100 concurrent requests (estimated)

**Future Scale Targets** (Preliminary):
- Support 10,000+ concurrent users
- <200ms average response time at scale
- 99.9% uptime SLA
- Handle datasets 10x larger than current

**Scaling Strategies** (To Be Tested):
- Horizontal scaling with load balancers
- Database read replicas for query distribution
- CDN for static/cacheable responses
- Query optimization and indexing
- Caching layer (Redis) for frequent queries

### 📈 Success Metrics

#### API Adoption
- Number of registered API users/applications
- API request volume and growth
- Geographic distribution of API consumers
- Use case diversity (research, journalism, civic tech, etc.)

#### Data Impact
- Number of transparency applications built
- Media coverage citing API data
- Research papers using API data
- Citizen engagement and awareness

#### Technical Performance
- API uptime (target: 99.9%)
- Average response time (target: <200ms)
- Error rate (target: <0.1%)
- Data freshness (target: updated within 24 hours of source updates)

### 🤝 Community & Collaboration

#### Open Source Commitment
All Open APIs will be:
- **Open Source**: Publicly available code repositories
- **Community-Driven**: Accepting contributions and feedback
- **Transparent Development**: Public roadmaps and issue tracking
- **Free to Use**: No API fees for non-commercial use

#### Partnership Opportunities
- **Government Agencies**: Direct collaboration for data access and validation
- **Civil Society**: Partnerships with transparency and accountability organizations
- **Academic Institutions**: Research collaborations and data validation
- **Private Sector**: API ecosystem for civic tech startups and enterprises

#### Developer Community
- **API Documentation Portal**: Comprehensive guides and tutorials
- **Developer Forum**: Community support and discussions
- **Hackathons**: Regular events to showcase API capabilities
- **Showcase Gallery**: Applications built with Open APIs
- **Developer Grants**: Funding for civic tech projects using the APIs

### 🎯 Open Government Goals

This initiative is part of BetterGovPH's mission to promote government transparency and open data. The APIs are designed to be:

- **Freely accessible** to developers, researchers, journalists, and citizens
- **Well-documented** with comprehensive guides and examples
- **Production-ready** for building transparency and accountability applications
- **Open source** for community contributions and improvements
- **Standards-compliant** following international open data best practices
- **Sustainable** with long-term maintenance and support commitments

### 📅 Timeline Overview

> **⚠️ TENTATIVE TIMELINE**: These dates are preliminary estimates and subject to change based on resource availability, community contributions, government partnerships, and technical feasibility.

| Year | Milestone | Status |
|------|-----------|--------|
| **2024-2025** | Open Budget API - Production Release | ✅ In Progress |
| **2025 Q2** | Open Education API - Beta Release | 📋 Planned (Data acquisition pending) |
| **2025 Q3** | Open Health API - Beta Release | 📋 Planned (Partnerships needed) |
| **2025 Q4** | Unified API Gateway Launch | 📋 Planned (Architecture under evaluation) |
| **2026 Q1** | Open Procurement API - Beta Release | 📋 Planned (Data sources identified) |
| **2026 Q2** | Open Infrastructure API - Beta Release | 📋 Planned |
| **2026 Q3** | Open Social Services API - Beta Release | 📋 Planned |
| **2027+** | Open Environmental, Justice, Agriculture APIs | 💡 Future Vision |

**Timeline Dependencies**:
- Government agency partnerships for data access
- Community contributions and volunteer developers
- Funding for infrastructure and maintenance
- Data quality validation and cleaning
- Legal clearances for sensitive datasets

### 🚀 Get Involved

This is an **open initiative** that welcomes contributions from the community:

- **Developers**: Contribute to API development, SDKs, and documentation
- **Data Scientists**: Help validate data quality and create analytics
- **Designers**: Improve API documentation and developer experience
- **Researchers**: Use the APIs for research and provide feedback
- **Government Officials**: Partner with us to open more datasets
- **Citizens**: Spread awareness and use the data for accountability

**Contact**: Submit issues or ideas via GitHub Issues in the respective API repositories

## 🔄 Plan Updates & Versioning

This plan is a **living document** that will be updated regularly as the project evolves.

**Latest Version**: 1.0 (January 2025)

**Update History**:
- **v1.0 (January 2025)**: Initial draft with preliminary architecture and roadmap

**Next Review**: Q2 2025 (After Open Budget API production release)

**How to Propose Changes**:
1. Open a [GitHub Discussion](https://github.com/bettergovph/open-budget-api/discussions) for architectural proposals
2. Submit a Pull Request to this document for specific improvements
3. Create an [Issue](https://github.com/bettergovph/open-budget-api/issues) for timeline or feature suggestions

## 📋 Disclaimer

This roadmap represents the **current vision and intentions** of the BetterGovPH Open Budget API project. However:

- ⚠️ **Nothing is guaranteed**: Features, timelines, and architecture are subject to change
- ⚠️ **Community-driven**: Success depends on community contributions and support
- ⚠️ **Resource-dependent**: Implementation depends on available time, funding, and partnerships
- ⚠️ **Experimental**: This is an exploratory initiative; some approaches may not work as planned
- ⚠️ **No warranties**: The project is provided "as-is" with no guarantees of completion or timelines

**What IS certain**:
- ✅ The Open Budget API codebase is open source and available now
- ✅ We are committed to transparency and open collaboration
- ✅ Community feedback will shape the direction of the project
- ✅ All decisions and changes will be documented publicly

---

**Built with ❤️ for Philippine Government Transparency and Accountability**

*This is a draft plan. Your feedback and contributions are essential to making this vision a reality.*
