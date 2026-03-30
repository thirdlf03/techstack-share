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
  { id: "js", name: "JavaScript", deviconClass: "devicon-javascript-original", category: "language" },
  { id: "ts", name: "TypeScript", deviconClass: "devicon-typescript-original", category: "language" },
  { id: "python", name: "Python", deviconClass: "devicon-python-original", category: "language" },
  { id: "go", name: "Go", deviconClass: "devicon-go-original", category: "language" },
  { id: "rust", name: "Rust", deviconClass: "devicon-rust-original", category: "language" },
  { id: "java", name: "Java", deviconClass: "devicon-java-original", category: "language" },
  { id: "csharp", name: "C#", deviconClass: "devicon-csharp-original", category: "language" },
  { id: "cpp", name: "C++", deviconClass: "devicon-cplusplus-original", category: "language" },
  { id: "ruby", name: "Ruby", deviconClass: "devicon-ruby-original", category: "language" },
  { id: "php", name: "PHP", deviconClass: "devicon-php-original", category: "language" },
  { id: "swift", name: "Swift", deviconClass: "devicon-swift-original", category: "language" },
  { id: "kotlin", name: "Kotlin", deviconClass: "devicon-kotlin-original", category: "language" },
  { id: "c", name: "C", deviconClass: "devicon-c-original", category: "language" },
  { id: "scala", name: "Scala", deviconClass: "devicon-scala-original", category: "language" },
  { id: "elixir", name: "Elixir", deviconClass: "devicon-elixir-original", category: "language" },
  { id: "dart", name: "Dart", deviconClass: "devicon-dart-original", category: "language" },
  { id: "r", name: "R", deviconClass: "devicon-r-original", category: "language" },
  { id: "lua", name: "Lua", deviconClass: "devicon-lua-original", category: "language" },
  { id: "haskell", name: "Haskell", deviconClass: "devicon-haskell-original", category: "language" },
  { id: "perl", name: "Perl", deviconClass: "devicon-perl-original", category: "language" },
  { id: "zig", name: "Zig", deviconClass: "devicon-zig-original", category: "language" },

  // Frontend
  { id: "react", name: "React", deviconClass: "devicon-react-original", category: "frontend" },
  { id: "vue", name: "Vue", deviconClass: "devicon-vuejs-original", category: "frontend" },
  { id: "nextjs", name: "Next.js", deviconClass: "devicon-nextjs-original", category: "frontend" },
  { id: "nuxt", name: "Nuxt", deviconClass: "devicon-nuxtjs-original", category: "frontend" },
  { id: "svelte", name: "Svelte", deviconClass: "devicon-svelte-original", category: "frontend" },
  { id: "angular", name: "Angular", deviconClass: "devicon-angularjs-original", category: "frontend" },
  { id: "astro", name: "Astro", deviconClass: "devicon-astro-original", category: "frontend" },
  { id: "solid", name: "SolidJS", deviconClass: "devicon-solidjs-original", category: "frontend" },
  { id: "htmx", name: "htmx", deviconClass: "devicon-htmx-original", category: "frontend" },
  {
    id: "tailwind",
    name: "Tailwind CSS",
    deviconClass: "devicon-tailwindcss-original",
    category: "frontend",
  },
  { id: "sass", name: "Sass", deviconClass: "devicon-sass-original", category: "frontend" },

  // Backend
  { id: "nodejs", name: "Node.js", deviconClass: "devicon-nodejs-original", category: "backend" },
  { id: "express", name: "Express", deviconClass: "devicon-express-original", category: "backend" },
  { id: "django", name: "Django", deviconClass: "devicon-django-plain", category: "backend" },
  { id: "flask", name: "Flask", deviconClass: "devicon-flask-original", category: "backend" },
  { id: "fastapi", name: "FastAPI", deviconClass: "devicon-fastapi-original", category: "backend" },
  { id: "spring", name: "Spring", deviconClass: "devicon-spring-original", category: "backend" },
  { id: "rails", name: "Rails", deviconClass: "devicon-rails-original-wordmark", category: "backend" },
  { id: "gin", name: "Gin", deviconClass: "devicon-gin-plain", category: "backend" },
  { id: "nestjs", name: "NestJS", deviconClass: "devicon-nestjs-original", category: "backend" },
  { id: "graphql", name: "GraphQL", deviconClass: "devicon-graphql-plain", category: "backend" },
  { id: "nginx", name: "Nginx", deviconClass: "devicon-nginx-original", category: "backend" },

  // Cloud
  {
    id: "aws",
    name: "AWS",
    deviconClass: "devicon-amazonwebservices-original-wordmark",
    category: "cloud",
  },
  { id: "gcp", name: "Google Cloud", deviconClass: "devicon-googlecloud-original", category: "cloud" },
  { id: "azure", name: "Azure", deviconClass: "devicon-azure-original", category: "cloud" },
  {
    id: "cloudflare",
    name: "Cloudflare",
    deviconClass: "devicon-cloudflare-original",
    category: "cloud",
  },
  { id: "vercel", name: "Vercel", deviconClass: "devicon-vercel-original", category: "cloud" },
  { id: "firebase", name: "Firebase", deviconClass: "devicon-firebase-original", category: "cloud" },
  { id: "heroku", name: "Heroku", deviconClass: "devicon-heroku-original", category: "cloud" },
  { id: "netlify", name: "Netlify", deviconClass: "devicon-netlify-original", category: "cloud" },
  {
    id: "digitalocean",
    name: "DigitalOcean",
    deviconClass: "devicon-digitalocean-original",
    category: "cloud",
  },

  // Database
  {
    id: "postgresql",
    name: "PostgreSQL",
    deviconClass: "devicon-postgresql-original",
    category: "database",
  },
  { id: "mysql", name: "MySQL", deviconClass: "devicon-mysql-original", category: "database" },
  { id: "mongodb", name: "MongoDB", deviconClass: "devicon-mongodb-original", category: "database" },
  { id: "redis", name: "Redis", deviconClass: "devicon-redis-original", category: "database" },
  { id: "sqlite", name: "SQLite", deviconClass: "devicon-sqlite-original", category: "database" },
  {
    id: "dynamodb",
    name: "DynamoDB",
    deviconClass: "devicon-dynamodb-original",
    category: "database",
  },
  {
    id: "supabase",
    name: "Supabase",
    deviconClass: "devicon-supabase-original",
    category: "database",
  },
  { id: "neo4j", name: "Neo4j", deviconClass: "devicon-neo4j-original", category: "database" },
  {
    id: "cassandra",
    name: "Cassandra",
    deviconClass: "devicon-cassandra-original",
    category: "database",
  },

  // DevOps
  { id: "docker", name: "Docker", deviconClass: "devicon-docker-original", category: "devops" },
  {
    id: "kubernetes",
    name: "Kubernetes",
    deviconClass: "devicon-kubernetes-original",
    category: "devops",
  },
  {
    id: "terraform",
    name: "Terraform",
    deviconClass: "devicon-terraform-original",
    category: "devops",
  },
  {
    id: "githubactions",
    name: "GitHub Actions",
    deviconClass: "devicon-githubactions-original",
    category: "devops",
  },
  { id: "jenkins", name: "Jenkins", deviconClass: "devicon-jenkins-original", category: "devops" },
  { id: "ansible", name: "Ansible", deviconClass: "devicon-ansible-original", category: "devops" },
  {
    id: "prometheus",
    name: "Prometheus",
    deviconClass: "devicon-prometheus-original",
    category: "devops",
  },
  { id: "grafana", name: "Grafana", deviconClass: "devicon-grafana-original", category: "devops" },
  { id: "gitlab", name: "GitLab CI", deviconClass: "devicon-gitlab-original", category: "devops" },
  { id: "circleci", name: "CircleCI", deviconClass: "devicon-circleci-plain", category: "devops" },
  { id: "argocd", name: "ArgoCD", deviconClass: "devicon-argocd-original", category: "devops" },

  // Mobile
  {
    id: "reactnative",
    name: "React Native",
    deviconClass: "devicon-react-original",
    category: "mobile",
  },
  { id: "flutter", name: "Flutter", deviconClass: "devicon-flutter-plain", category: "mobile" },
  { id: "swiftui", name: "SwiftUI", deviconClass: "devicon-swift-original", category: "mobile" },
  { id: "android", name: "Android", deviconClass: "devicon-android-original", category: "mobile" },
  { id: "xcode", name: "Xcode", deviconClass: "devicon-xcode-original", category: "mobile" },

  // Other
  { id: "git", name: "Git", deviconClass: "devicon-git-original", category: "other" },
  { id: "linux", name: "Linux", deviconClass: "devicon-linux-original", category: "other" },
  { id: "vim", name: "Vim", deviconClass: "devicon-vim-original", category: "other" },
  { id: "neovim", name: "Neovim", deviconClass: "devicon-neovim-original", category: "other" },
  { id: "vscode", name: "VS Code", deviconClass: "devicon-vscode-original", category: "other" },
  { id: "figma", name: "Figma", deviconClass: "devicon-figma-original", category: "other" },
  { id: "notion", name: "Notion", deviconClass: "devicon-notion-original", category: "other" },
  { id: "bash", name: "Bash", deviconClass: "devicon-bash-original", category: "other" },
  {
    id: "raspberrypi",
    name: "Raspberry Pi",
    deviconClass: "devicon-raspberrypi-original",
    category: "other",
  },
  { id: "ubuntu", name: "Ubuntu", deviconClass: "devicon-ubuntu-original", category: "other" },
  { id: "debian", name: "Debian", deviconClass: "devicon-debian-original", category: "other" },
  {
    id: "jetbrains",
    name: "JetBrains",
    deviconClass: "devicon-jetbrains-original",
    category: "other",
  },
];

const technologiesByCategory = Object.freeze(
  Object.fromEntries(
    CATEGORIES.map((category) => [
      category,
      technologies.filter((tech) => tech.category === category),
    ]),
  ) as Record<Category, Technology[]>,
);

export function getTechById(id: string): Technology | undefined {
  return technologies.find((t) => t.id === id);
}

export function getTechsByCategory(category: Category): Technology[] {
  return technologiesByCategory[category];
}
