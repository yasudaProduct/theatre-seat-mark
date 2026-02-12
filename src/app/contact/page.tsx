import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ContactPage() {
  return (
    <div className="container mx-auto mt-4 sm:mt-10 mb-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle></CardTitle>
        </CardHeader>
        <CardContent>
          <iframe
            className="overflow-hidden"
            style={{ border: "none", width: "100%" }}
            height="600"
            src="https://www.noway-form.com/ja/f/beb1df70-2e2a-40af-bf71-8ea3cc6a2236/embed"
          />
        </CardContent>
      </Card>
    </div>
  );
}
