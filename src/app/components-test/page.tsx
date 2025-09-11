"use client";

import { useState } from "react";
import { ShaleanCard, ServiceCard, BookingCard } from "@/components/shared/ShaleanCard";
import { ContactForm, BookingForm } from "@/components/shared/ShaleanForm";
import { ShaleanModal, ConfirmationModal, BookingModal, ServiceSelectionModal } from "@/components/shared/ShaleanModal";
import { Button } from "@/components/ui/button";

export default function ComponentsTestPage() {
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);
  const [isContactFormLoading, setIsContactFormLoading] = useState(false);
  const [isBookingFormLoading, setIsBookingFormLoading] = useState(false);
  
  // Modal states
  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isServiceSelectionModalOpen, setIsServiceSelectionModalOpen] = useState(false);
  const [isConfirmationLoading, setIsConfirmationLoading] = useState(false);

  const handleContactSubmit = async (data: any) => {
    setIsContactFormLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log("Contact form submitted:", data);
    setIsContactFormLoading(false);
    alert("Contact form submitted successfully!");
  };

  const handleBookingSubmit = async (data: any) => {
    setIsBookingFormLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log("Booking form submitted:", data);
    setIsBookingFormLoading(false);
    alert("Booking submitted successfully!");
  };

  const handleConfirmation = async () => {
    setIsConfirmationLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log("Confirmation action completed");
    setIsConfirmationLoading(false);
    setIsConfirmationModalOpen(false);
    alert("Action completed successfully!");
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    console.log("Service selected:", serviceId);
  };

  const services = [
    {
      id: "regular",
      title: "Regular Cleaning",
      description: "Weekly or bi-weekly cleaning service",
      price: "$80",
      duration: "2-3 hours",
      features: [
        "Dust all surfaces",
        "Vacuum and mop floors",
        "Clean bathrooms",
        "Kitchen cleaning",
        "Trash removal"
      ]
    },
    {
      id: "deep",
      title: "Deep Cleaning",
      description: "Comprehensive cleaning for first-time or special occasions",
      price: "$150",
      duration: "4-6 hours",
      features: [
        "Everything in regular cleaning",
        "Inside appliances",
        "Baseboards and trim",
        "Light fixtures",
        "Window sills"
      ]
    },
    {
      id: "move",
      title: "Move In/Out Cleaning",
      description: "Complete cleaning for moving transitions",
      price: "$200",
      duration: "6-8 hours",
      features: [
        "Everything in deep cleaning",
        "Inside cabinets",
        "Light fixtures",
        "All appliances",
        "Garage cleaning"
      ]
    }
  ];

  const sampleBookings = [
    {
      id: "1",
      title: "Regular Cleaning - 123 Main St",
      status: "confirmed" as const,
      date: "2024-01-15",
      time: "10:00 AM",
      address: "123 Main Street, Apt 4B",
      cleaner: "Sarah Johnson",
      onView: () => alert("View booking details"),
      onEdit: () => alert("Edit booking")
    },
    {
      id: "2",
      title: "Deep Cleaning - 456 Oak Ave",
      status: "in-progress" as const,
      date: "2024-01-16",
      time: "9:00 AM",
      address: "456 Oak Avenue",
      cleaner: "Mike Chen",
      onView: () => alert("View booking details"),
      onEdit: () => alert("Edit booking")
    },
    {
      id: "3",
      title: "Move Out Cleaning - 789 Pine St",
      status: "completed" as const,
      date: "2024-01-14",
      time: "8:00 AM",
      address: "789 Pine Street",
      cleaner: "Lisa Rodriguez",
      onView: () => alert("View booking details")
    }
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Shalean Components Test</h1>
          <p className="text-lg text-muted-foreground">
            Testing our reusable UI components for the cleaning services app
          </p>
        </div>

        {/* Basic Card Variants */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Basic Card Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ShaleanCard
              title="Default Card"
              description="This is a default card with standard styling"
              variant="default"
            >
              <p className="text-sm text-muted-foreground">
                This card uses the default variant with standard background and text colors.
              </p>
            </ShaleanCard>

            <ShaleanCard
              title="Primary Card"
              description="This card uses primary brand colors"
              variant="primary"
            >
              <p className="text-sm">
                This card uses the primary variant with our brand blue background.
              </p>
            </ShaleanCard>

            <ShaleanCard
              title="Secondary Card"
              description="This card uses secondary colors"
              variant="secondary"
            >
              <p className="text-sm">
                This card uses the secondary variant with light blue background.
              </p>
            </ShaleanCard>

            <ShaleanCard
              title="Accent Card"
              description="This card uses accent colors"
              variant="accent"
            >
              <p className="text-sm">
                This card uses the accent variant with our brand green background.
              </p>
            </ShaleanCard>
          </div>
        </section>

        {/* Service Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Service Selection Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                title={service.title}
                description={service.description}
                price={service.price}
                duration={service.duration}
                features={service.features}
                isSelected={selectedService === service.id}
                onSelect={() => setSelectedService(service.id)}
              />
            ))}
          </div>
          {selectedService && (
            <div className="text-center">
              <p className="text-muted-foreground">
                Selected service: {services.find(s => s.id === selectedService)?.title}
              </p>
            </div>
          )}
        </section>

        {/* Booking Cards */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Booking Management Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                title={booking.title}
                status={booking.status}
                date={booking.date}
                time={booking.time}
                address={booking.address}
                cleaner={booking.cleaner}
                onView={booking.onView}
                onEdit={booking.onEdit}
              />
            ))}
          </div>
        </section>

        {/* Form Components */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-foreground">Form Components</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Contact Form</h3>
              <ShaleanCard variant="outline">
                <ContactForm
                  onSubmit={handleContactSubmit}
                  submitText="Send Message"
                  isLoading={isContactFormLoading}
                />
              </ShaleanCard>
            </div>

            {/* Booking Form */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Booking Form</h3>
              <ShaleanCard variant="outline">
                <BookingForm
                  onSubmit={handleBookingSubmit}
                  submitText="Book Service"
                  isLoading={isBookingFormLoading}
                />
              </ShaleanCard>
            </div>
          </div>
        </section>

        {/* Card with Actions */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Cards with Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ShaleanCard
              title="Card with Action Button"
              description="This card includes an action button in the header"
              action={
                <Button size="sm" variant="outline">
                  Action
                </Button>
              }
            >
              <p className="text-sm text-muted-foreground">
                This card demonstrates how to include action buttons in the card header.
              </p>
            </ShaleanCard>

            <ShaleanCard
              title="Card with Footer"
              description="This card includes a footer section"
              footer={
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last updated: Today</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost">Edit</Button>
                    <Button size="sm" variant="destructive">Delete</Button>
                  </div>
                </div>
              }
            >
              <p className="text-sm text-muted-foreground">
                This card demonstrates how to include footer content with actions.
              </p>
            </ShaleanCard>
          </div>
        </section>

        {/* Size Variants */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Card Size Variants</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ShaleanCard
              title="Small Card"
              description="Compact card for quick information"
              size="sm"
            >
              <p className="text-sm text-muted-foreground">Small padding and compact layout.</p>
            </ShaleanCard>

            <ShaleanCard
              title="Medium Card"
              description="Standard card size for most content"
              size="md"
            >
              <p className="text-sm text-muted-foreground">Medium padding and standard layout.</p>
            </ShaleanCard>

            <ShaleanCard
              title="Large Card"
              description="Spacious card for detailed content"
              size="lg"
            >
              <p className="text-sm text-muted-foreground">Large padding and spacious layout.</p>
            </ShaleanCard>
          </div>
        </section>

        {/* Modal Components */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Modal Components</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ShaleanCard variant="outline">
              <h3 className="font-semibold mb-2">Basic Modal</h3>
              <p className="text-sm text-muted-foreground mb-4">
                A simple modal with title, description, and content.
              </p>
              <Button onClick={() => setIsBasicModalOpen(true)}>
                Open Basic Modal
              </Button>
            </ShaleanCard>

            <ShaleanCard variant="outline">
              <h3 className="font-semibold mb-2">Confirmation Modal</h3>
              <p className="text-sm text-muted-foreground mb-4">
                A modal for confirming destructive actions.
              </p>
              <Button 
                variant="destructive" 
                onClick={() => setIsConfirmationModalOpen(true)}
              >
                Open Confirmation
              </Button>
            </ShaleanCard>

            <ShaleanCard variant="outline">
              <h3 className="font-semibold mb-2">Booking Modal</h3>
              <p className="text-sm text-muted-foreground mb-4">
                A specialized modal for viewing booking details.
              </p>
              <Button onClick={() => setIsBookingModalOpen(true)}>
                View Booking
              </Button>
            </ShaleanCard>

            <ShaleanCard variant="outline">
              <h3 className="font-semibold mb-2">Service Selection</h3>
              <p className="text-sm text-muted-foreground mb-4">
                A modal for selecting cleaning services.
              </p>
              <Button onClick={() => setIsServiceSelectionModalOpen(true)}>
                Select Service
              </Button>
            </ShaleanCard>
          </div>
        </section>
      </div>

      {/* Modal Components */}
      <ShaleanModal
        open={isBasicModalOpen}
        onOpenChange={setIsBasicModalOpen}
        title="Basic Modal Example"
        description="This is a basic modal with custom content"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This modal demonstrates the basic functionality of the ShaleanModal component.
            It includes a title, description, and custom content area.
          </p>
          <div className="p-4 bg-secondary rounded-lg">
            <h4 className="font-medium mb-2">Features:</h4>
            <ul className="text-sm space-y-1">
              <li>• Customizable size variants</li>
              <li>• Multiple color variants</li>
              <li>• Accessible keyboard navigation</li>
              <li>• Click outside to close</li>
            </ul>
          </div>
        </div>
      </ShaleanModal>

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={handleConfirmation}
        title="Confirm Action"
        description="Are you sure you want to proceed with this action? This cannot be undone."
        confirmText="Yes, Proceed"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isConfirmationLoading}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        bookingData={{
          id: "1",
          title: "Regular Cleaning - 123 Main St",
          status: "confirmed",
          date: "2024-01-15",
          time: "10:00 AM",
          address: "123 Main Street, Apt 4B",
          cleaner: "Sarah Johnson"
        }}
        onEdit={() => {
          setIsBookingModalOpen(false);
          alert("Edit booking functionality would be implemented here");
        }}
        onCancel={() => {
          setIsBookingModalOpen(false);
          alert("Cancel booking functionality would be implemented here");
        }}
      />

      <ServiceSelectionModal
        isOpen={isServiceSelectionModalOpen}
        onClose={() => setIsServiceSelectionModalOpen(false)}
        onSelect={handleServiceSelect}
        services={services}
        selectedServiceId={selectedService}
      />
    </div>
  );
}
