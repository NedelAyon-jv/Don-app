# Don-App Server

A Node.js server application for the Don-App donation management platform, built with TypeScript and Firebase.

## 📋 Features

- User authentication and authorization
- Publication management (donations, requests, exchanges)
- Real-time updates using Firebase
- Location-based services
- Image handling
- Donation center management

## 🚀 Getting Started

### Prerequisites

- Node.js 16 or higher
- Bun runtime
- Firebase account and project
- Environment variables properly configured

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Don-app.git
cd Don-app/server
```

2. Install dependencies:
```bash
bun install
```

3. Create a `.env` file in the server root directory:
```env
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

4. Start the development server:
```bash
bun run dev
```

## 🏗️ Project Structure

```
server/
├── src/
│   ├── models/         # Data models and schemas
│   ├── services/       # Business logic and Firebase services
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Custom middleware
│   └── utils/          # Helper functions
├── tests/              # Test files
└── config/            # Configuration files
```

## 📚 API Documentation

### Publications

- `POST /api/publications` - Create a new publication
- `GET /api/publications` - List publications with filters
- `GET /api/publications/:id` - Get publication details
- `PUT /api/publications/:id` - Update a publication
- `DELETE /api/publications/:id` - Delete a publication

### Users

- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

### Donation Centers

- `POST /api/centers` - Create a donation center
- `GET /api/centers` - List donation centers
- `GET /api/centers/:id/publications` - Get center's publications

## 🧪 Testing

Run tests using:

```bash
bun test
```

## 🔒 Security

- Firebase Authentication for user management
- Role-based access control
- Data validation using schemas
- Request rate limiting
- Secure environment variable handling

## 📦 Dependencies

- Firebase Admin SDK
- Express.js
- TypeScript
- Zod (for validation)
- Other core dependencies...

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔧 Troubleshooting

Common issues and their solutions:

- **Firebase connection issues**: Verify your Firebase credentials
- **TypeScript errors**: Run `bun run type-check` to verify types
- **Authentication errors**: Check user permissions and token validity

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.