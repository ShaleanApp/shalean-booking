import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Users, Shield, Clock, Sparkles } from "lucide-react";
import Script from "next/script";
import { ServiceBrowser } from "@/components/services/ServiceBrowser";

export default function Home() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '${baseUrl}'
  
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${baseUrl}/#organization`,
        "name": "Shalean Cleaning Services",
        "alternateName": "Shalean Cleaning",
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`,
          "width": 200,
          "height": 200
        },
        "image": `${baseUrl}/og-image.jpg`,
        "description": "Professional cleaning services for your home and office. Book online with Shalean Cleaning Services for reliable, affordable, and eco-friendly cleaning solutions.",
        "telephone": "+1-555-123-4567",
        "email": "info@shaleancleaning.com",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "123 Main St",
          "addressLocality": "City",
          "addressRegion": "State",
          "postalCode": "12345",
          "addressCountry": "US"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "40.7128",
          "longitude": "-74.0060"
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            "opens": "08:00",
            "closes": "18:00"
          }
        ],
        "priceRange": "$$",
        "paymentAccepted": ["Cash", "Credit Card", "Check"],
        "currenciesAccepted": "USD",
        "areaServed": {
          "@type": "City",
          "name": "City, State"
        },
        "serviceArea": {
          "@type": "GeoCircle",
          "geoMidpoint": {
            "@type": "GeoCoordinates",
            "latitude": "40.7128",
            "longitude": "-74.0060"
          },
          "geoRadius": "50000"
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": "Cleaning Services",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Residential Cleaning",
                "description": "Regular home cleaning services including living areas, kitchen, bathrooms, and bedrooms",
                "provider": {
                  "@id": "${baseUrl}/#organization"
                }
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Deep Cleaning",
                "description": "Thorough cleaning for special occasions including inside appliances, baseboards, and light fixtures",
                "provider": {
                  "@id": "${baseUrl}/#organization"
                }
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Move-in/Move-out Cleaning",
                "description": "Cleaning for transitions including empty property cleaning, cabinet interiors, and window cleaning",
                "provider": {
                  "@id": "${baseUrl}/#organization"
                }
              }
            },
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Service",
                "name": "Commercial Cleaning",
                "description": "Office and business cleaning including office spaces, restrooms, and common areas",
                "provider": {
                  "@id": "${baseUrl}/#organization"
                }
              }
            }
          ]
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "150",
          "bestRating": "5",
          "worstRating": "1"
        },
        "review": [
          {
            "@type": "Review",
            "author": {
              "@type": "Person",
              "name": "Sarah Johnson"
            },
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "5",
              "bestRating": "5"
            },
            "reviewBody": "Excellent service! The team was professional, thorough, and respectful. My home has never looked better."
          },
          {
            "@type": "Review",
            "author": {
              "@type": "Person",
              "name": "Michael Chen"
            },
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "5",
              "bestRating": "5"
            },
            "reviewBody": "Reliable, trustworthy, and always on time. I've been using their services for over a year and couldn't be happier."
          },
          {
            "@type": "Review",
            "author": {
              "@type": "Person",
              "name": "Emily Rodriguez"
            },
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "5",
              "bestRating": "5"
            },
            "reviewBody": "The move-out cleaning was perfect. They made sure every detail was covered and I got my full security deposit back."
          }
        ]
      },
      {
        "@type": "WebSite",
        "@id": "${baseUrl}/#website",
        "url": "${baseUrl}",
        "name": "Shalean Cleaning Services",
        "description": "Professional cleaning services for your home and office",
        "publisher": {
          "@id": "${baseUrl}/#organization"
        },
        "potentialAction": [
          {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "${baseUrl}/search?q={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        ]
      },
      {
        "@type": "WebPage",
        "@id": "${baseUrl}/#webpage",
        "url": "${baseUrl}",
        "name": "Shalean Cleaning Services - Professional Home & Office Cleaning",
        "isPartOf": {
          "@id": "${baseUrl}/#website"
        },
        "about": {
          "@id": "${baseUrl}/#organization"
        },
        "description": "Professional cleaning services for your home and office. Book online with Shalean Cleaning Services for reliable, affordable, and eco-friendly cleaning solutions.",
        "breadcrumb": {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "${baseUrl}"
            }
          ]
        }
      }
    ]
  };

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Professional Cleaning Services
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Clean Homes,{" "}
              <span className="text-blue-600 dark:text-blue-400">Happy Lives</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Professional cleaning services for your home and office. 
              Book online, get reliable service, and enjoy a spotless space.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/book">Book Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                <Link href="/services">View Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Shalean Cleaning?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We provide exceptional cleaning services with a focus on quality, reliability, and customer satisfaction.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Insured & Bonded</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Fully insured and bonded for your peace of mind. Your property and belongings are protected.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>Professional Team</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Experienced, trained, and background-checked professionals who take pride in their work.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Flexible Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Book one-time or recurring services that fit your schedule. Available 7 days a week.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Comprehensive cleaning solutions for every need
            </p>
          </div>
          
          <ServiceBrowser maxItems={8} />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  "Excellent service! The team was professional, thorough, and respectful. 
                  My home has never looked better."
                </p>
                <div className="font-semibold">Sarah Johnson</div>
                <div className="text-sm text-gray-500">Regular Customer</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  "Reliable, trustworthy, and always on time. I've been using their services 
                  for over a year and couldn't be happier."
                </p>
                <div className="font-semibold">Michael Chen</div>
                <div className="text-sm text-gray-500">Office Manager</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  "The move-out cleaning was perfect. They made sure every detail was covered 
                  and I got my full security deposit back."
                </p>
                <div className="font-semibold">Emily Rodriguez</div>
                <div className="text-sm text-gray-500">Recent Move</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Experience Clean?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Book your cleaning service today and enjoy a spotless home or office.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
            <Link href="/book">Get Started Now</Link>
          </Button>
        </div>
      </section>
      </div>
    </>
  );
}
