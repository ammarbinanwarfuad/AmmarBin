"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema } from "@/lib/validations";
import { z } from "zod";
import toast from "react-hot-toast";

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Message sent successfully! I'll get back to you soon.");
        reset();
      } else {
        const errorMsg = result.error || result.details || "Failed to send message";
        console.error("Contact form error:", result);
        toast.error(`Error: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMsg = error instanceof Error ? error.message : "Network error occurred";
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Get in Touch
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
              Have a question or want to work together? Feel free to reach out!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Contact Info */}
              <div className="md:col-span-1 space-y-6">
                <Card className="p-6">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Email
                      </h3>
                      <a
                        href="mailto:ammarbinanwarfuad@gmail.com"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        ammarbinanwarfuad@gmail.com
                      </a>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Location
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Dhaka, Bangladesh
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Contact Form */}
              <Card className="md:col-span-2 p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Your name"
                      className="mt-2"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="your.email@example.com"
                      className="mt-2"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      {...register("subject")}
                      placeholder="What's this about?"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      {...register("message")}
                      placeholder="Your message..."
                      rows={6}
                      className="mt-2"
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full gap-2"
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Send Message
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

