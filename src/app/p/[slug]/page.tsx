import { createUntypedClient } from "@/lib/supabase/server";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
    MapPin,
    Link as LinkIcon,
    CheckCircle2,
    Globe,
    Twitter,
    Instagram,
    Linkedin,
    Github,
    Mail,
    TrendingUp
} from "lucide-react";
import { Metadata } from "next";
import { ProfileLinks } from "./_components/profile-links";
import { ContactForm } from "./_components/contact-form";
import { ProfileViewTracker } from "./_components/profile-view-tracker";
import { QRCodeDisplay } from "./_components/qr-code-display";

interface PublicProfilePageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: PublicProfilePageProps): Promise<Metadata> {
    const supabase = await createUntypedClient();
    const { slug } = await params;

    const { data: profile } = await supabase
        .from("public_profiles")
        .select("headline, summary, seo_title, seo_description, og_image_url, avatar_url, banner_url")
        .eq("slug", slug)
        .eq("is_public", true)
        .single();

    if (!profile) {
        return {
            title: "Profile Not Found | ATLVS",
        };
    }

    const title = profile.seo_title || profile.headline || slug;
    const description = profile.seo_description || profile.summary || `View ${profile.headline || slug}'s profile on ATLVS Network`;
    const ogImage = profile.og_image_url || profile.banner_url || profile.avatar_url;

    return {
        title: `${title} | ATLVS Network`,
        description,
        openGraph: {
            title: `${title} | ATLVS Network`,
            description,
            images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : [],
            type: "profile",
            url: `https://atlvs.network/p/${slug}`,
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | ATLVS Network`,
            description,
            images: ogImage ? [ogImage] : [],
        },
    };
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
    const supabase = await createUntypedClient();
    const { slug } = await params;

    const { data: profile, error } = await supabase
        .from("public_profiles")
        .select("*")
        .eq("slug", slug)
        .eq("is_public", true)
        .single();

    if (error || !profile) {
        notFound();
    }

    const socialIcons = {
        twitter: Twitter,
        instagram: Instagram,
        linkedin: Linkedin,
        github: Github,
        website: Globe,
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            {/* Banner */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
                {profile.banner_url ? (
                    <Image
                        src={profile.banner_url}
                        alt="Banner"
                        className="w-full h-full object-cover"
                        fill
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-semantic-indigo via-semantic-purple to-semantic-accent" />
                )}
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative -mt-24 md:-mt-32 mb-6">
                    {/* Avatar */}
                    <div className="relative inline-block">
                        <div className="h-32 w-32 md:h-48 md:w-48 rounded-full border-4 border-background overflow-hidden bg-muted">
                            {profile.avatar_url ? (
                                <Image
                                    src={profile.avatar_url}
                                    alt={profile.headline}
                                    className="w-full h-full object-cover"
                                    fill
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-semantic-indigo/10 text-semantic-indigo">
                                    <Globe className="h-12 w-12 md:h-20 md:w-20" />
                                </div>
                            )}
                        </div>
                        {profile.is_verified && (
                            <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-card rounded-full p-1 shadow-lg">
                                <CheckCircle2 className="h-6 w-6 md:h-8 md:w-8 text-semantic-info fill-semantic-info/10" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                                        {profile.headline || profile.slug}
                                    </h1>
                                    <div className="mt-2 flex items-center gap-3">
                                        <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                                            {profile.entity_type}
                                        </Badge>
                                        {profile.organization_id && (
                                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                Global Network
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 text-lg text-muted-foreground leading-relaxed">
                                {profile.summary}
                            </div>
                        </section>

                        {profile.detailed_bio && (
                            <section className="prose dark:prose-invert max-w-none">
                                <h2 className="text-2xl font-bold border-b pb-2 mb-4">About</h2>
                                <div dangerouslySetInnerHTML={{ __html: profile.detailed_bio }} />
                            </section>
                        )}

                        {profile.gallery && profile.gallery.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold border-b pb-2 mb-6">Portfolio</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {profile.gallery.map((item: { url: string; caption?: string }, idx: number) => (
                                        <div key={idx} className="aspect-square relative rounded-xl overflow-hidden group">
                                            <Image
                                                src={item.url}
                                                alt={item.caption || "Gallery item"}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                fill
                                                unoptimized
                                            />
                                            {item.caption && (
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                    <p className="text-white text-sm font-medium">{item.caption}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Social Links */}
                        <div className="bg-card rounded-2xl p-6 shadow-sm border">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Network & Social</h3>
                            <div className="space-y-3">
                                {Object.entries(profile.social_links || {}).map(([key, url]: [string, unknown]) => {
                                    const Icon = socialIcons[key as keyof typeof socialIcons] || LinkIcon;
                                    return (
                                        <a
                                            key={key}
                                            href={url as string}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors group"
                                        >
                                            <Icon className="h-5 w-5 text-muted-foreground group-hover:text-semantic-indigo" />
                                            <span className="text-sm font-medium capitalize">{key}</span>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Contact */}
                        {profile.contact_info && (
                            <div className="bg-card rounded-2xl p-6 shadow-sm border">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Contact</h3>
                                <div className="space-y-4">
                                    {profile.contact_info.email && (
                                        <div className="flex items-center gap-3">
                                            <Mail className="h-5 w-5 text-muted-foreground" />
                                            <span className="text-sm">{profile.contact_info.email}</span>
                                        </div>
                                    )}
                                    {profile.contact_info.phone && (
                                        <div className="flex items-center gap-3">
                                            <span className="h-5 w-5 flex items-center justify-center text-muted-foreground font-bold">#</span>
                                            <span className="text-sm">{profile.contact_info.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Metrics */}
                        <div className="bg-semantic-indigo rounded-2xl p-6 text-white shadow-lg shadow-semantic-indigo/20">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider opacity-80">Profile Reach</h3>
                                <TrendingUp className="h-5 w-5 opacity-80" />
                            </div>
                            <div className="text-4xl font-black">{profile.views_count?.toLocaleString() || 0}</div>
                            <div className="mt-1 text-sm opacity-80 font-medium tracking-wide">TOTAL VIEWS</div>
                        </div>

                        {/* QR Code */}
                        <QRCodeDisplay
                            profileUrl={`https://atlvs.network/p/${slug}`}
                            profileSlug={slug}
                            themeConfig={profile.theme_config}
                        />

                        {/* Lead Capture Form */}
                        {profile.lead_capture_enabled && (
                            <ContactForm
                                profileId={profile.id}
                                leadCaptureType={profile.lead_capture_type || "contact"}
                                themeConfig={profile.theme_config}
                            />
                        )}
                    </div>
                </div>

                {/* Custom Links Section */}
                {profile.profile_links && profile.profile_links.length > 0 && (
                    <div className="mt-8">
                        <ProfileLinks
                            links={profile.profile_links}
                            themeConfig={profile.theme_config}
                        />
                    </div>
                )}

                {/* Footer */}
                <div className="mt-20 pb-10 flex flex-col items-center justify-center gap-4 text-muted-foreground opacity-50">
                    <div className="flex items-center gap-2 font-black text-sm tracking-tighter">
                        <span className="bg-semantic-indigo text-white px-1 rounded">A</span>
                        ATLVS NETWORK
                    </div>
                    <p className="text-xs">© 2026 ATLVS. All identities verified on-chain.</p>
                </div>
            </div>

            {/* View Tracker */}
            <ProfileViewTracker profileId={profile.id} />
        </div>
    );
}
