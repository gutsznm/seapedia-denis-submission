import Header from "@/components/header";
import { Separator } from "@/components/ui/separator";
import Hero from "@/components/hero";
import ProductCatalogue from "@/components/product-catalogue/product-catalogue";
import AppReviews from "@/components/app-reviews";

export default function Homepage() {
    return (
        <>
        <Header/>
        <Separator/>
        <Hero/>
        <ProductCatalogue/>
        <AppReviews/>
        </>
    )
}