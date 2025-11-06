import { LazyMotionDiv } from "@/components/LazyMotion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

export default async function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-4xl">
          <LazyMotionDiv
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
              <ContactForm />
            </div>
          </LazyMotionDiv>
        </div>
      </main>
      <Footer />
    </div>
  );
}
