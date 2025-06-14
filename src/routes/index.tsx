import { createFileRoute } from '@tanstack/react-router'
import { Icon } from '@iconify/react/dist/iconify.js'
import { Button, Card, CardBody, Chip } from '@heroui/react'
import { RouterLink } from '@/components/router-link'

export const Route = createFileRoute('/')({
  validateSearch: (search) => {
    if (search.forceSignIn) {
      return { forceSignIn: true }
    }
    return {}
  },
  component: Home,
})

function Home() {
  const features = [
    {
      icon: 'lucide:mic',
      title: 'Session Audio Transcription',
      description:
        'Record your TTRPG sessions and get accurate AI-powered transcriptions with speaker diarization. Never miss important story moments again.',
      color: 'text-blue-500',
    },
    {
      icon: 'lucide:message-circle',
      title: 'AI Campaign Chat',
      description:
        'Ask questions about your campaign using natural language. Our AI searches through all your session transcripts to provide contextual answers.',
      color: 'text-green-500',
    },
    {
      icon: 'lucide:users',
      title: 'Campaign Management',
      description:
        'Organize campaigns, sessions, and characters. Invite players and track attendance across sessions with ease.',
      color: 'text-purple-500',
    },
    {
      icon: 'lucide:search',
      title: 'Vector Search',
      description:
        'Find specific moments, conversations, or plot points across all your sessions using intelligent semantic search.',
      color: 'text-orange-500',
    },
    {
      icon: 'lucide:shield-check',
      title: 'Secure & Private',
      description:
        'Your campaign data is secure with authentication, encrypted storage, and private campaign access controls.',
      color: 'text-red-500',
    },
    {
      icon: 'lucide:zap',
      title: 'Real-time Sync',
      description:
        'All your campaign data syncs in real-time across devices, ensuring everyone stays up to date.',
      color: 'text-yellow-500',
    },
  ]

  // const testimonialFeatures = [
  //   'Transcription powered by AssemblyAI',
  //   'Vector embeddings for intelligent search',
  //   'Real-time collaboration',
  //   'Secure authentication with Clerk',
  //   'Cloud storage with Convex database',
  //   'Modern responsive design',
  // ]

  return (
    <div className="flex-1 overflow-auto">
      {/* Hero Section */}
      <section className="min-h-screen relative bg-gradient-to-br from-primary-50 to-secondary-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.05)_1px,transparent_0)] bg-[length:24px_24px]" />

        <div className="relative z-10 min-h-screen flex items-center">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-5 gap-12 items-center">
              {/* Left side - Text content (rule of thirds: 3/5) */}
              <div className="lg:col-span-3 space-y-8">
                <div className="flex items-center gap-3 mb-6 lg:justify-start justify-center">
                  <Icon
                    icon="lucide:orbit"
                    width="48"
                    height="48"
                    className="text-primary-500 animate-[spin_20s_linear_infinite]"
                  />
                  <span className="text-2xl font-bold text-foreground">
                    IounAI
                  </span>
                </div>

                <div className="space-y-6 lg:text-left text-center">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                    <span className="block mb-2">AI-Powered</span>
                    <span className="block bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                      TTRPG Campaign
                    </span>
                    <span className="block">Management</span>
                  </h1>

                  <p className="text-xl text-foreground-600 leading-relaxed max-w-xl lg:mx-0 mx-auto">
                    Transform your tabletop gaming experience with intelligent
                    session transcription, AI-powered campaign insights, and
                    seamless collaboration tools.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 lg:justify-start justify-center pt-4">
                    <RouterLink to="/app">
                      <Button
                        color="primary"
                        size="lg"
                        className="font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-shadow"
                        startContent={
                          <Icon icon="lucide:play" className="text-xl" />
                        }
                      >
                        Start Your Campaign
                      </Button>
                    </RouterLink>
                    <Button
                      variant="bordered"
                      size="lg"
                      className="font-semibold px-8 py-6 text-lg hover:bg-background/50 transition-colors"
                      startContent={
                        <Icon icon="lucide:info" className="text-xl" />
                      }
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right side - Visual elements (rule of thirds: 2/5) */}
              <div className="lg:col-span-2 relative lg:block hidden">
                <div className="relative">
                  {/* Large background orbit */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Icon
                      icon="lucide:orbit"
                      width="300"
                      height="300"
                      className="text-primary-200 animate-[spin_40s_linear_infinite]"
                    />
                  </div>

                  {/* Feature icons orbiting */}
                  <div className="relative w-80 h-80 mx-auto">
                    {/* Transcription icon */}
                    <div className="absolute top-4 right-12 animate-[float_6s_ease-in-out_infinite]">
                      <div className="p-4 bg-blue-500/10 rounded-full backdrop-blur-sm border border-blue-500/20">
                        <Icon
                          icon="lucide:mic"
                          className="text-2xl text-blue-500"
                        />
                      </div>
                    </div>

                    {/* Chat icon */}
                    <div className="absolute top-24 left-4 animate-[float_6s_ease-in-out_infinite_2s]">
                      <div className="p-4 bg-green-500/10 rounded-full backdrop-blur-sm border border-green-500/20">
                        <Icon
                          icon="lucide:message-circle"
                          className="text-2xl text-green-500"
                        />
                      </div>
                    </div>

                    {/* Users icon */}
                    <div className="absolute bottom-24 right-4 animate-[float_6s_ease-in-out_infinite_4s]">
                      <div className="p-4 bg-purple-500/10 rounded-full backdrop-blur-sm border border-purple-500/20">
                        <Icon
                          icon="lucide:users"
                          className="text-2xl text-purple-500"
                        />
                      </div>
                    </div>

                    {/* Search icon */}
                    <div className="absolute bottom-4 left-12 animate-[float_6s_ease-in-out_infinite_1s]">
                      <div className="p-4 bg-orange-500/10 rounded-full backdrop-blur-sm border border-orange-500/20">
                        <Icon
                          icon="lucide:search"
                          className="text-2xl text-orange-500"
                        />
                      </div>
                    </div>

                    {/* Central glow effect */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-full blur-xl"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile visual element */}
        <div className="lg:hidden flex justify-center pb-12">
          <div className="relative">
            <Icon
              icon="lucide:orbit"
              width="200"
              height="200"
              className="text-primary-300 animate-[spin_20s_linear_infinite]"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-r from-primary-500/30 to-secondary-500/30 rounded-full blur-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Enhance Your TTRPG Experience
            </h2>
            <p className="text-xl text-foreground-600 max-w-3xl mx-auto">
              From session recording to AI-powered insights, IounAI provides
              everything you need to manage unforgettable campaigns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow duration-300"
              >
                <CardBody className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="p-4 bg-blue-500/10 rounded-full backdrop-blur-sm border border-blue-500/20">
                      <Icon
                        icon={feature.icon}
                        className={`text-2xl ${feature.color}`}
                      />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-foreground-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-secondary-50 to-primary-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Powered by Modern AI Technology
          </h2>
          <p className="text-xl text-foreground-600 mb-12">
            Built with cutting-edge tools and AI services to deliver the best
            possible experience.
          </p>

          {/* <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            {testimonialFeatures.map((tech, index) => (
              <Chip
                key={index}
                variant="flat"
                color="primary"
                size="lg"
                className="py-3"
              >
                {tech}
              </Chip>
            ))}
          </div> */}

          <Card className="bg-background/80 backdrop-blur-sm">
            <CardBody className="p-8">
              <div className="flex items-center justify-center mb-6">
                <Icon
                  icon="lucide:sparkles"
                  className="text-4xl text-primary-500 mr-3"
                />
                <h3 className="text-2xl font-bold text-foreground">
                  Coming Soon: Advanced AI Features
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    <Icon
                      icon="lucide:message-square"
                      className="inline mr-2"
                    />
                    NPC Chat Interactions
                  </h4>
                  <p className="text-foreground-600 text-sm">
                    Have conversations with NPCs powered by AI, with GM
                    oversight and approval.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    <Icon icon="lucide:book-open" className="inline mr-2" />
                    Story Generation
                  </h4>
                  <p className="text-foreground-600 text-sm">
                    Generate campaign summaries and story books from your
                    session transcripts.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Transform Your Campaigns?
          </h2>
          <p className="text-xl text-foreground-600 mb-12">
            Join game masters and players who are already using AI to enhance
            their TTRPG experience.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <RouterLink to="/app">
              <Button
                color="primary"
                size="lg"
                className="font-semibold px-8 py-6 text-lg"
                startContent={<Icon icon="lucide:rocket" className="text-xl" />}
              >
                Get Started Free
              </Button>
            </RouterLink>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <Icon
                icon="lucide:clock"
                className="text-3xl text-primary-500 mx-auto mb-4"
              />
              <h3 className="font-semibold text-foreground mb-2">
                Quick Setup
              </h3>
              <p className="text-foreground-600 text-sm">
                Get your first campaign up and running in minutes
              </p>
            </div>
            <div className="text-center">
              <Icon
                icon="lucide:users"
                className="text-3xl text-primary-500 mx-auto mb-4"
              />
              <h3 className="font-semibold text-foreground mb-2">
                Team Collaboration
              </h3>
              <p className="text-foreground-600 text-sm">
                Invite players and manage campaigns together
              </p>
            </div>
            <div className="text-center">
              <Icon
                icon="lucide:shield"
                className="text-3xl text-primary-500 mx-auto mb-4"
              />
              <h3 className="font-semibold text-foreground mb-2">
                Secure & Private
              </h3>
              <p className="text-foreground-600 text-sm">
                Your campaign data is protected and private
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
