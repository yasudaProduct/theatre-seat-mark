import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import path from "path";
import fs from "fs";
import Markdown from "react-markdown";

async function getDocsContent() {
  const basePath = path.join(process.cwd(), "public", "docs");
  const overviewPolicyPath = path.join(basePath, "overview.md");
  const privacyPolicyPath = path.join(basePath, "privacy-policy.md");
  const termsPolicyPath = path.join(basePath, "terms.md");

  const overviewContent = fs.readFileSync(overviewPolicyPath, "utf8");
  const privacyPolicy = fs.readFileSync(privacyPolicyPath, "utf8");
  const termsPolicy = fs.readFileSync(termsPolicyPath, "utf8");

  return {
    overviewContent,
    privacyPolicy,
    termsPolicy,
  };
}

export default async function DocsPage() {
  const { overviewContent, privacyPolicy, termsPolicy } = await getDocsContent();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">シネポジについて</TabsTrigger>
          <TabsTrigger value="privacy">プライバシーポリシー</TabsTrigger>
          <TabsTrigger value="terms">利用規約</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="">
          <div className="markdown">
            <Markdown>{overviewContent}</Markdown>
          </div>
        </TabsContent>
        <TabsContent value="privacy" className="prose prose-slate">
          <div className="markdown">
            <Markdown>{privacyPolicy}</Markdown>
          </div>
        </TabsContent>
        <TabsContent value="terms" className="prose prose-slate">
          <div className="markdown">
            <Markdown>{termsPolicy}</Markdown>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
