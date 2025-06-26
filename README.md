# E-commerce & Supply Chain Management System

A modern Next.js 14 application built with React 18, featuring a comprehensive e-commerce platform with supply chain management capabilities. This application provides different interfaces for customers, staff, warehouse managers, and administrators.

## 🎨 Design Theme

**Metallic Chic Theme**
- Primary Colors: #3D52A0, #7091E6, #8697C4, #ADBBDA, #EDE8F5
- Fully responsive design (desktop, tablet, mobile)
- Modern animations and micro-interactions
- Touch-friendly interface for mobile devices

## 🚀 Features

### Customer Interface
- Product browsing and search
- Shopping cart management
- Order placement and tracking
- User account management
- Responsive e-commerce experience

### Staff Interface
- Order processing and management
- Order status updates
- Payment status management
- Customer service tools
- Performance dashboard

### Warehouse Manager Interface
- Inventory management
- Request order approval/rejection
- Stock level monitoring
- Low stock alerts
- Shipment tracking

### Admin Interface
- Complete system overview
- Product catalog management (CRUD)
- User management
- Order monitoring
- Request order management
- Analytics and reporting

## 🛠 Technology Stack

- **Frontend**: Next.js 14, React 18
- **Styling**: Tailwind CSS, Custom CSS
- **Icons**: Lucide React
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **Development**: Vite, ESLint

## 📦 Installation

1. **Clone or extract the project**
   ```bash
   cd ecommerce-supply-chain
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://laravel-wtc.onrender.com/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   pnpm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗 Project Structure

```
ecommerce-supply-chain/
├── components/
│   ├── layout/
│   │   └── Layout.js          # Main layout component
│   ├── ui/                    # Reusable UI components
│   └── common/                # Common components
├── lib/
│   ├── api/
│   │   └── client.js          # API client configuration
│   ├── auth/
│   │   └── authContext.js     # Authentication context
│   └── utils/                 # Utility functions
├── pages/
│   ├── admin/
│   │   ├── index.js           # Admin dashboard
│   │   └── products.js        # Product management
│   ├── auth/
│   │   ├── login.js           # Login page
│   │   └── register.js        # Registration page
│   ├── customer/
│   │   ├── index.js           # Customer dashboard
│   │   ├── products.js        # Product catalog
│   │   ├── cart.js            # Shopping cart
│   │   └── orders.js          # Order history
│   ├── staff/
│   │   ├── index.js           # Staff dashboard
│   │   └── orders.js          # Order management
│   ├── warehouse/
│   │   ├── index.js           # Warehouse dashboard
│   │   └── request-orders.js  # Request order management
│   ├── _app.js                # App configuration
│   ├── index.js               # Home page
│   └── dashboard.js           # General dashboard
├── styles/
│   └── globals.css            # Global styles and theme
├── public/                    # Static assets
├── next.config.js             # Next.js configuration
└── package.json               # Dependencies and scripts
```

## 🔐 Authentication & User Roles

The application supports four user roles:

1. **Customer** - E-commerce shopping experience
2. **Staff** - Order processing and customer service
3. **Warehouse Manager** - Inventory and request management
4. **Admin** - Complete system administration

## 🎯 API Integration

The application is designed to work with the Laravel backend API:
- Base URL: `https://laravel-wtc.onrender.com/api`
- Authentication: Token-based authentication
- Endpoints: RESTful API design

### Key API Endpoints

- **Authentication**: `/login`, `/register`, `/logout`
- **Products**: `/products` (CRUD operations)
- **Orders**: `/orders` (management and tracking)
- **Request Orders**: `/request-orders` (warehouse approval)
- **Users**: `/users` (user management)
- **Dashboard**: Role-specific dashboard data

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured interface with advanced interactions
- **Tablet**: Optimized layout with touch-friendly controls
- **Mobile**: Streamlined interface with essential features

### Responsive Features
- Adaptive grid layouts
- Touch-friendly button sizes (44px minimum)
- Optimized typography scaling
- Mobile-first CSS approach
- Gesture-friendly interactions

## 🎨 Animations & Interactions

- **Hover Effects**: Lift, scale, and glow animations
- **Loading States**: Skeleton screens and spinners
- **Transitions**: Smooth page and component transitions
- **Micro-interactions**: Button feedback and form validation
- **Scroll Animations**: Progressive content reveal

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- **Components**: Functional components with hooks
- **Styling**: Utility-first CSS with Tailwind
- **State Management**: Context API for global state
- **Error Handling**: Comprehensive error boundaries
- **Accessibility**: WCAG 2.1 compliant

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables

For production deployment, ensure these environment variables are set:

```env
NEXT_PUBLIC_API_BASE_URL=your-api-base-url
NODE_ENV=production
```

## 🔒 Security Features

- **Authentication**: Secure token-based authentication
- **Authorization**: Role-based access control
- **Input Validation**: Client-side and server-side validation
- **CSRF Protection**: Built-in Next.js CSRF protection
- **XSS Prevention**: Sanitized user inputs

## 🎯 Performance Optimizations

- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Component and route lazy loading
- **Caching**: Efficient API response caching
- **Bundle Analysis**: Optimized bundle sizes

## 📊 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile, Samsung Internet
- **Minimum Requirements**: ES6+ support

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Ensure responsive design principles
3. Test across different devices and browsers
4. Maintain accessibility standards
5. Update documentation as needed

## 📄 License

This project is built for educational and demonstration purposes.

## 🆘 Support

For technical support or questions:
1. Check the browser console for error messages
2. Verify API connectivity and authentication
3. Ensure all dependencies are properly installed
4. Check responsive design on different screen sizes

---

**Built with ❤️ using Next.js 14 and modern web technologies**

