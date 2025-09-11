
"use client";

import React, { useState, useEffect } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, MapPin, Building, Hash, Home, Check, ArrowRight, Loader2, ArrowLeft, LocateFixed, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Wifi } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";


// =====================================================
// Schemas de Validação por Etapa
// =====================================================
const stepSchemas = [
  // Etapa 1: Dados de Contato
  z.object({
    fullName: z.string().min(3, "Nome completo é obrigatório"),
    email: z.string().email("E-mail inválido"),
    phone: z.string().min(10, "Telefone inválido"),
  }),
  // Etapa 2: Endereço
  z.object({
    dontKnowCep: z.boolean().optional(),
    cep: z.string(),
    street: z.string().min(3, "Rua é obrigatória"),
    number: z.string().min(1, "Número é obrigatório"),
    complement: z.string().optional(),
    neighborhood: z.string().min(3, "Bairro é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z.string().min(2, "Estado é obrigatório"),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).refine(data => data.dontKnowCep || (data.cep && data.cep.length >= 8), {
      message: "CEP inválido",
      path: ["cep"],
  }),
  // Etapa 3: Confirmação (sem validação, apenas exibição)
  z.object({}),
];

type FormData = z.infer<typeof stepSchemas[0]> & z.infer<typeof stepSchemas[1]>;

// Tipos para API do IBGE
interface UF { id: number; sigla: string; nome: string; }
interface City { id: number; nome: string; }


// =====================================================
// Componentes da UI do Formulário
// =====================================================

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {[...Array(totalSteps)].map((_, i) => (
      <div
        key={i}
        className={`w-12 h-2 rounded-full transition-colors ${
          i < currentStep ? "bg-primary" : "bg-secondary"
        }`}
      />
    ))}
  </div>
);

const FormHeader = ({ title, description }: { title: string; description: string }) => (
  <div className="text-center mb-8">
    <h2 className="text-2xl font-bold text-foreground">{title}</h2>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const FormNavigation = ({ currentStep, totalSteps, goBack, isSubmitting }: { currentStep: number; totalSteps: number; goBack: () => void, isSubmitting: boolean }) => (
  <div className="mt-8 flex justify-between items-center">
    <Button id={`step-${currentStep}-back`} type="button" variant="outline" onClick={goBack} disabled={currentStep === 1 || isSubmitting}>
      <ArrowLeft className="h-4 w-4 mr-2" />
      Voltar
    </Button>
    <Button id={`step-${currentStep}-next`} type="submit" disabled={isSubmitting}>
      {isSubmitting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
         {currentStep === totalSteps ? "Confirmar Assinatura" : "Próximo"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </>
      )}
    </Button>
  </div>
);


// =====================================================
// Etapas do Formulário
// =====================================================

const Step1 = () => (
    <>
      <FormField name="fullName" render={({ field }) => (
        <FormItem>
          <FormLabel>Nome Completo</FormLabel>
          <FormControl>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="signup-fullname" placeholder="Seu nome" {...field} className="pl-9" />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <div className="grid md:grid-cols-2 gap-4">
        <FormField name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>E-mail</FormLabel>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="signup-email" placeholder="seu@email.com" {...field} className="pl-9" />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField name="phone" render={({ field }) => (
          <FormItem>
            <FormLabel>Telefone</FormLabel>
            <FormControl>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="signup-phone" placeholder="(00) 00000-0000" {...field} className="pl-9" />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </div>
    </>
);

const Step2 = ({ form }: { form: any }) => {
    const [loadingCep, setLoadingCep] = useState(false);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const { toast } = useToast();
    const dontKnowCep = useWatch({ control: form.control, name: "dontKnowCep" });

    const [ufs, setUfs] = useState<UF[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [loadingUfs, setLoadingUfs] = useState(false);
    const [loadingCities, setLoadingCities] = useState(false);

    const selectedUf = useWatch({ control: form.control, name: 'state' });

    useEffect(() => {
        setLoadingUfs(true);
        fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
          .then(res => res.json())
          .then(data => { setUfs(data); })
          .catch(() => toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar os estados."}))
          .finally(() => setLoadingUfs(false));
    }, [toast]);
    
    useEffect(() => {
        if (!selectedUf) return;
        setLoadingCities(true);
        form.setValue('city', '');
        fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
          .then(res => res.json())
          .then(data => { setCities(data); })
          .catch(() => toast({ variant: "destructive", title: "Erro", description: "Não foi possível carregar as cidades."}))
          .finally(() => setLoadingCities(false));
    }, [selectedUf, form, toast]);


    const handleCepLookup = async () => {
        const cep = form.getValues("cep").replace(/\D/g, "");
        if (cep.length !== 8) {
          form.setError("cep", { message: "CEP inválido." });
          return;
        }
        setLoadingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if(!response.ok) throw new Error();
            const data = await response.json();
            if(data.erro) throw new Error("CEP não encontrado.");

            form.setValue("street", data.logradouro, { shouldValidate: true });
            form.setValue("neighborhood", data.bairro, { shouldValidate: true });
            form.setValue("city", data.localidade, { shouldValidate: true });
            form.setValue("state", data.uf, { shouldValidate: true });
        } catch (error) {
            form.setError("cep", { message: "CEP não encontrado." });
        } finally {
            setLoadingCep(false);
        }
    };
    
    const handleGeolocation = () => {
        if (!navigator.geolocation) {
            toast({ variant: "destructive", title: "Erro", description: "Geolocalização não é suportada por este navegador."});
            return;
        }
        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                form.setValue("latitude", latitude, { shouldValidate: true });
                form.setValue("longitude", longitude, { shouldValidate: true });
                toast({ title: "Sucesso!", description: `Localização obtida: Lat ${latitude.toFixed(4)}, Lon ${longitude.toFixed(4)}` });
                setLoadingLocation(false);
            },
            (error) => {
                toast({ variant: "destructive", title: "Erro de Localização", description: error.message });
                setLoadingLocation(false);
            },
            { enableHighAccuracy: true }
        );
    };

    return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div className="md:col-span-1">
          <FormField
            name="cep"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CEP</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="signup-cep" placeholder="00000-000" {...field} disabled={dontKnowCep} className="pl-9 pr-24" />
                    <Button id="signup-cep-lookup" type="button" onClick={handleCepLookup} disabled={loadingCep || dontKnowCep} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2 text-xs">
                      {loadingCep ? <Loader2 className="h-3 w-3 animate-spin" /> : "Buscar"}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="md:col-span-2">
            <FormField name="street" render={({ field }) => (
              <FormItem>
                <FormLabel>Rua</FormLabel>
                <FormControl><Input id="signup-street" placeholder="Sua rua" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
        </div>
      </div>
      <FormField
          control={form.control}
          name="dontKnowCep"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-x-2 space-y-0 mt-2 mb-4">
              <FormControl>
              <Checkbox
                  id="signup-no-cep"
                  checked={field.value}
                  onCheckedChange={field.onChange}
              />
              </FormControl>
              <FormLabel className="cursor-pointer font-normal text-sm">Não sei meu CEP</FormLabel>
            </FormItem>
          )}
      />
        <div className="grid md:grid-cols-3 gap-4">
            <FormField name="number" render={({ field }) => (
                <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl><Input id="signup-number" placeholder="123" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )} />
            <FormField name="complement" render={({ field }) => (
                <FormItem className="md:col-span-2">
                <FormLabel>Complemento <span className="text-muted-foreground">(opcional)</span></FormLabel>
                <FormControl><Input id="signup-complement" placeholder="Apto, bloco, etc." {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )} />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
            <FormField name="neighborhood" render={({ field }) => (
                <FormItem>
                <FormLabel>Bairro</FormLabel>
                <FormControl><Input id="signup-neighborhood" placeholder="Seu bairro" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )} />
            <FormField name="state" render={({ field }) => (
                <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger id="signup-state" disabled={loadingUfs}>
                      <SelectValue placeholder={loadingUfs ? "Carregando..." : "Selecione o estado"}/>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ufs.map(uf => <SelectItem key={uf.id} value={uf.sigla}>{uf.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )} />
            <FormField name="city" render={({ field }) => (
                <FormItem>
                <FormLabel>Cidade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!selectedUf || loadingCities}>
                    <FormControl>
                        <SelectTrigger id="signup-city" disabled={!selectedUf || loadingCities}>
                            <SelectValue placeholder={!selectedUf ? "Selecione um estado" : loadingCities ? "Carregando..." : "Selecione a cidade"} />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {cities.map(city => <SelectItem key={city.id} value={city.nome}>{city.nome}</SelectItem>)}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )} />
        </div>
        <div className="mt-4 pt-4 border-t border-border">
            <FormLabel>Localização Precisa (Opcional)</FormLabel>
            <div className="flex items-center gap-4 mt-2">
                <Button id="signup-geolocation" type="button" variant="outline" onClick={handleGeolocation} disabled={loadingLocation}>
                    {loadingLocation ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LocateFixed className="h-4 w-4 mr-2" />}
                    Usar minha localização
                </Button>
                <div className="text-xs text-muted-foreground">
                    <p>Latitude: {form.getValues("latitude")?.toFixed(5) || "--"}</p>
                    <p>Longitude: {form.getValues("longitude")?.toFixed(5) || "--"}</p>
                </div>
            </div>
            <FormField name="latitude" render={({ field }) => (<FormItem><FormControl><Input type="hidden" {...field} /></FormControl></FormItem>)} />
            <FormField name="longitude" render={({ field }) => (<FormItem><FormControl><Input type="hidden" {...field} /></FormControl></FormItem>)} />
            <p className="text-xs text-muted-foreground mt-2">Ajuda a agilizar a verificação de viabilidade técnica.</p>
        </div>
    </>
    );
};

const Step3 = ({ data }: { data: FormData }) => (
    <div>
        <h3 className="text-lg font-semibold mb-4 border-b border-border pb-2">Confirme seus dados</h3>
        <div className="space-y-4 text-sm">
            <div>
                <p className="font-semibold text-muted-foreground">Dados Pessoais</p>
                <div className="p-4 rounded-xl bg-secondary border mt-2 space-y-2">
                    <p><strong>Nome:</strong> {data.fullName}</p>
                    <p><strong>Email:</strong> {data.email}</p>
                    <p><strong>Telefone:</strong> {data.phone}</p>
                </div>
            </div>
            <div>
                <p className="font-semibold text-muted-foreground">Endereço de Instalação</p>
                <div className="p-4 rounded-xl bg-secondary border mt-2 space-y-2">
                    <p>{data.street}, {data.number} {data.complement && `- ${data.complement}`}</p>
                    <p>{data.neighborhood}, {data.city} - {data.state}</p>
                    {!data.dontKnowCep && <p><strong>CEP:</strong> {data.cep}</p>}
                    {data.latitude && data.longitude && (
                        <p><strong>Localização:</strong> Lat: {data.latitude.toFixed(5)}, Lon: {data.longitude.toFixed(5)}</p>
                    )}
                </div>
            </div>
        </div>
    </div>
);


const SuccessScreen = () => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8"
    >
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground">Solicitação enviada!</h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Sua solicitação de assinatura foi enviada com sucesso. Em breve, nossa equipe entrará em contato para agendar a instalação.
        </p>
        <Button asChild className="mt-8" id="signup-success-back">
            <Link href="/">Voltar para o início</Link>
        </Button>
    </motion.div>
);

// =====================================================
// Componente Principal da Página
// =====================================================

export default function ReferralSignupPage({ params }: { params: { id: string } }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({
    fullName: '',
    email: '',
    phone: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    dontKnowCep: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  
  const totalSteps = 3;
  const currentValidationSchema = stepSchemas[currentStep - 1];

  const methods = useForm({
    resolver: zodResolver(currentValidationSchema),
    mode: "onChange",
    defaultValues: formData
  });

  const goNext = async (data: any) => {
    const newFormData = { ...formData, ...data };
    setFormData(newFormData);
    const referrerId = params.id;

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      methods.reset(newFormData);
    } else {
      setIsSubmitting(true);
      const supabase = createClient();
      const { fullName, email, phone } = newFormData;
      const { dontKnowCep, ...leadData } = newFormData;


      const { error: leadError } = await supabase.from("leads").insert({
        ...leadData,
        full_name: fullName,
      });
      if (leadError) {
        toast({
          variant: "destructive",
          title: "Erro ao Enviar Lead",
          description: `Não foi possível enviar sua solicitação: ${leadError.message}`,
        });
        setIsSubmitting(false);
        return;
      }
      
      const { error: referralError } = await supabase.from("referrals").insert({
          referrer_customer_id: referrerId,
          referred_name: fullName,
          referred_phone: phone,
          referred_email: email,
          status: 'pendente'
      });
       if (referralError) {
        toast({
          variant: "destructive",
          title: "Erro ao Registrar Indicação",
          description: `Sua solicitação foi enviada, mas houve um erro ao registrar a indicação: ${referralError.message}`,
        });
      }

      setIsSuccess(true);
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const stepHeaders = [
    { title: "Seus Dados de Contato", description: "Para mantermos você informado sobre a instalação." },
    { title: "Endereço de Instalação", description: "Onde você quer sua nova conexão ultrarrápida?" },
    { title: "Revise e Confirme", description: "Verifique se todos os dados estão corretos antes de finalizar." }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
       <header className="py-4 px-6 border-b border-border bg-card">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-green-400 text-white shadow-lg shadow-primary/20">
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold leading-none text-foreground">Velpro Telecom</p>
            <p className="text-xs text-muted-foreground">Assinatura de Plano</p>
          </div>
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-3xl mx-auto rounded-3xl border border-border bg-card text-card-foreground p-6 md:p-8 shadow-xl">
          {isSuccess ? <SuccessScreen /> : (
            <>
            <div className="mb-6 border-b border-border pb-6">
                <div className="flex items-center gap-3 text-lg font-semibold text-primary bg-primary/10 border border-primary/20 rounded-xl p-4">
                    <Gift className="w-6 h-6"/>
                    <span>Você foi indicado! Preencha o formulário para continuar seu cadastro.</span>
                </div>
            </div>
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(goNext)} className="space-y-6" data-lead-form="true">
                <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
                <FormHeader 
                    title={stepHeaders[currentStep-1].title} 
                    description={stepHeaders[currentStep-1].description} 
                />
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {currentStep === 1 && <Step1 />}
                        {currentStep === 2 && <Step2 form={methods} />}
                        {currentStep === 3 && <Step3 data={formData as FormData} />}
                    </motion.div>
                </AnimatePresence>
                
                <FormNavigation currentStep={currentStep} totalSteps={totalSteps} goBack={goBack} isSubmitting={isSubmitting} />
              </form>
            </FormProvider>
             <p className="text-center text-xs text-muted-foreground mt-6">Seus dados estão seguros conosco.</p>
             </>
          )}
        </div>
      </main>
    </div>
  );
}
