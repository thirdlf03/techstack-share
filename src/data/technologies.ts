export const CATEGORIES = [
  "language",
  "frontend",
  "backend",
  "cloud",
  "database",
  "devops",
  "mobile",
  "other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  language: "Language",
  frontend: "Frontend",
  backend: "Backend",
  cloud: "Cloud",
  database: "Database",
  devops: "DevOps",
  mobile: "Mobile",
  other: "Other",
};

export type Technology = {
  id: string;
  name: string;
  deviconClass: string;
  category: Category;
};

export const technologies: Technology[] = [
  // Language
  { id: "js", name: "JavaScript", deviconClass: "devicon-javascript-plain", category: "language" },
  { id: "ts", name: "TypeScript", deviconClass: "devicon-typescript-plain", category: "language" },
  { id: "python", name: "Python", deviconClass: "devicon-python-plain", category: "language" },
  { id: "go", name: "Go", deviconClass: "devicon-go-plain", category: "language" },
  { id: "rust", name: "Rust", deviconClass: "devicon-rust-original", category: "language" },
  { id: "java", name: "Java", deviconClass: "devicon-java-plain", category: "language" },
  { id: "csharp", name: "C#", deviconClass: "devicon-csharp-plain", category: "language" },
  { id: "cpp", name: "C++", deviconClass: "devicon-cplusplus-plain", category: "language" },
  { id: "ruby", name: "Ruby", deviconClass: "devicon-ruby-plain", category: "language" },
  { id: "php", name: "PHP", deviconClass: "devicon-php-plain", category: "language" },
  { id: "swift", name: "Swift", deviconClass: "devicon-swift-plain", category: "language" },
  { id: "kotlin", name: "Kotlin", deviconClass: "devicon-kotlin-plain", category: "language" },
  { id: "c", name: "C", deviconClass: "devicon-c-plain", category: "language" },
  { id: "scala", name: "Scala", deviconClass: "devicon-scala-plain", category: "language" },
  { id: "elixir", name: "Elixir", deviconClass: "devicon-elixir-plain", category: "language" },
  { id: "dart", name: "Dart", deviconClass: "devicon-dart-plain", category: "language" },
  { id: "r", name: "R", deviconClass: "devicon-r-plain", category: "language" },
  { id: "lua", name: "Lua", deviconClass: "devicon-lua-plain", category: "language" },
  { id: "haskell", name: "Haskell", deviconClass: "devicon-haskell-plain", category: "language" },
  { id: "perl", name: "Perl", deviconClass: "devicon-perl-plain", category: "language" },
  { id: "zig", name: "Zig", deviconClass: "devicon-zig-plain", category: "language" },

  // Frontend
  { id: "react", name: "React", deviconClass: "devicon-react-plain", category: "frontend" },
  { id: "vue", name: "Vue", deviconClass: "devicon-vuejs-plain", category: "frontend" },
  { id: "nextjs", name: "Next.js", deviconClass: "devicon-nextjs-plain", category: "frontend" },
  { id: "nuxt", name: "Nuxt", deviconClass: "devicon-nuxtjs-plain", category: "frontend" },
  { id: "svelte", name: "Svelte", deviconClass: "devicon-svelte-plain", category: "frontend" },
  { id: "angular", name: "Angular", deviconClass: "devicon-angularjs-plain", category: "frontend" },
  { id: "astro", name: "Astro", deviconClass: "devicon-astro-plain", category: "frontend" },
  { id: "solid", name: "SolidJS", deviconClass: "devicon-solidjs-plain", category: "frontend" },
  { id: "htmx", name: "htmx", deviconClass: "devicon-htmx-plain", category: "frontend" },
  { id: "tailwind", name: "Tailwind CSS", deviconClass: "devicon-tailwindcss-plain", category: "frontend" },
  { id: "sass", name: "Sass", deviconClass: "devicon-sass-original", category: "frontend" },

  // Backend
  { id: "nodejs", name: "Node.js", deviconClass: "devicon-nodejs-plain", category: "backend" },
  { id: "express", name: "Express", deviconClass: "devicon-express-original", category: "backend" },
  { id: "django", name: "Django", deviconClass: "devicon-django-plain", category: "backend" },
  { id: "flask", name: "Flask", deviconClass: "devicon-flask-original", category: "backend" },
  { id: "fastapi", name: "FastAPI", deviconClass: "devicon-fastapi-plain", category: "backend" },
  { id: "spring", name: "Spring", deviconClass: "devicon-spring-plain", category: "backend" },
  { id: "rails", name: "Rails", deviconClass: "devicon-rails-plain", category: "backend" },
  { id: "gin", name: "Gin", deviconClass: "devicon-gin-plain", category: "backend" },
  { id: "nestjs", name: "NestJS", deviconClass: "devicon-nestjs-plain", category: "backend" },
  { id: "graphql", name: "GraphQL", deviconClass: "devicon-graphql-plain", category: "backend" },
  { id: "nginx", name: "Nginx", deviconClass: "devicon-nginx-original", category: "backend" },

  // Cloud
  { id: "aws", name: "AWS", deviconClass: "devicon-amazonwebservices-plain-wordmark", category: "cloud" },
  { id: "gcp", name: "Google Cloud", deviconClass: "devicon-googlecloud-plain", category: "cloud" },
  { id: "azure", name: "Azure", deviconClass: "devicon-azure-plain", category: "cloud" },
  { id: "cloudflare", name: "Cloudflare", deviconClass: "devicon-cloudflare-plain", category: "cloud" },
  { id: "vercel", name: "Vercel", deviconClass: "devicon-vercel-original", category: "cloud" },
  { id: "firebase", name: "Firebase", deviconClass: "devicon-firebase-plain", category: "cloud" },
  { id: "heroku", name: "Heroku", deviconClass: "devicon-heroku-original", category: "cloud" },
  { id: "netlify", name: "Netlify", deviconClass: "devicon-netlify-plain", category: "cloud" },
  { id: "digitalocean", name: "DigitalOcean", deviconClass: "devicon-digitalocean-plain", category: "cloud" },

  // Database
  { id: "postgresql", name: "PostgreSQL", deviconClass: "devicon-postgresql-plain", category: "database" },
  { id: "mysql", name: "MySQL", deviconClass: "devicon-mysql-plain", category: "database" },
  { id: "mongodb", name: "MongoDB", deviconClass: "devicon-mongodb-plain", category: "database" },
  { id: "redis", name: "Redis", deviconClass: "devicon-redis-plain", category: "database" },
  { id: "sqlite", name: "SQLite", deviconClass: "devicon-sqlite-plain", category: "database" },
  { id: "dynamodb", name: "DynamoDB", deviconClass: "devicon-dynamodb-plain", category: "database" },
  { id: "supabase", name: "Supabase", deviconClass: "devicon-supabase-plain", category: "database" },
  { id: "neo4j", name: "Neo4j", deviconClass: "devicon-neo4j-plain", category: "database" },
  { id: "cassandra", name: "Cassandra", deviconClass: "devicon-cassandra-plain", category: "database" },

  // DevOps
  { id: "docker", name: "Docker", deviconClass: "devicon-docker-plain", category: "devops" },
  { id: "kubernetes", name: "Kubernetes", deviconClass: "devicon-kubernetes-plain", category: "devops" },
  { id: "terraform", name: "Terraform", deviconClass: "devicon-terraform-plain", category: "devops" },
  { id: "githubactions", name: "GitHub Actions", deviconClass: "devicon-githubactions-plain", category: "devops" },
  { id: "jenkins", name: "Jenkins", deviconClass: "devicon-jenkins-plain", category: "devops" },
  { id: "ansible", name: "Ansible", deviconClass: "devicon-ansible-plain", category: "devops" },
  { id: "prometheus", name: "Prometheus", deviconClass: "devicon-prometheus-original", category: "devops" },
  { id: "grafana", name: "Grafana", deviconClass: "devicon-grafana-plain", category: "devops" },
  { id: "gitlab", name: "GitLab CI", deviconClass: "devicon-gitlab-plain", category: "devops" },
  { id: "circleci", name: "CircleCI", deviconClass: "devicon-circleci-plain", category: "devops" },
  { id: "argocd", name: "ArgoCD", deviconClass: "devicon-argocd-plain", category: "devops" },

  // Mobile
  { id: "reactnative", name: "React Native", deviconClass: "devicon-react-plain", category: "mobile" },
  { id: "flutter", name: "Flutter", deviconClass: "devicon-flutter-plain", category: "mobile" },
  { id: "swiftui", name: "SwiftUI", deviconClass: "devicon-swift-plain", category: "mobile" },
  { id: "android", name: "Android", deviconClass: "devicon-android-plain", category: "mobile" },
  { id: "xcode", name: "Xcode", deviconClass: "devicon-xcode-plain", category: "mobile" },

  // Other
  { id: "git", name: "Git", deviconClass: "devicon-git-plain", category: "other" },
  { id: "linux", name: "Linux", deviconClass: "devicon-linux-plain", category: "other" },
  { id: "vim", name: "Vim", deviconClass: "devicon-vim-plain", category: "other" },
  { id: "neovim", name: "Neovim", deviconClass: "devicon-neovim-plain", category: "other" },
  { id: "vscode", name: "VS Code", deviconClass: "devicon-vscode-plain", category: "other" },
  { id: "figma", name: "Figma", deviconClass: "devicon-figma-plain", category: "other" },
  { id: "notion", name: "Notion", deviconClass: "devicon-notion-plain", category: "other" },
  { id: "bash", name: "Bash", deviconClass: "devicon-bash-plain", category: "other" },
  { id: "raspberrypi", name: "Raspberry Pi", deviconClass: "devicon-raspberrypi-plain", category: "other" },
  { id: "ubuntu", name: "Ubuntu", deviconClass: "devicon-ubuntu-plain", category: "other" },
  { id: "debian", name: "Debian", deviconClass: "devicon-debian-plain", category: "other" },
  { id: "jetbrains", name: "JetBrains", deviconClass: "devicon-jetbrains-plain", category: "other" },
];

export function getTechById(id: string): Technology | undefined {
  return technologies.find((t) => t.id === id);
}

export function getTechsByCategory(category: Category): Technology[] {
  return technologies.filter((t) => t.category === category);
}
