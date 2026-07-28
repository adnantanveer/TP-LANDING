export const technologies = [
  'angular', 'react', 'node', 'python', 'aws', 'azure',
  'docker', 'flutter', 'java', 'springboot', 'kubernetes',
  'postgresql', 'mongodb', 'typescript',
].map((id) => ({ id, icon: `tech-${id}-icon`, label: labelFor(id) }))

function labelFor(id) {
  const labels = {
    angular: 'Angular',
    react: 'React',
    node: 'Node.js',
    python: 'Python',
    aws: 'AWS',
    azure: 'Azure',
    docker: 'Docker',
    flutter: 'Flutter',
    java: 'Java',
    springboot: 'Spring Boot',
    kubernetes: 'Kubernetes',
    postgresql: 'PostgreSQL',
    mongodb: 'MongoDB',
    typescript: 'TypeScript',
  }
  return labels[id]
}
