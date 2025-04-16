import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRequest } from "@/lib/services/requests";
import { Request } from "@/lib/types/request";
import { format } from "date-fns";
import { ArrowLeft } from 'lucide-react';
import Link from "next/link";

interface Props {
    params: {
        id: string;
    };
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Saisie':
            return 'bg-gray-100 text-gray-800';
        case 'Notifiée':
            return 'bg-blue-100 text-blue-800';
        case 'Clôturé':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getRequestTypeColor = (type: string) => {
    switch (type) {
        case 'Technical':
            return 'bg-purple-100 text-purple-800';
        case 'Commercial':
            return 'bg-indigo-100 text-indigo-800';
        case 'Support':
            return 'bg-cyan-100 text-cyan-800';
        case 'Logistique':
            return 'bg-orange-100 text-orange-800';
        case 'ADV':
            return 'bg-teal-100 text-teal-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const RequestDetailPage = async ({ params }: Props) => {
    const requestId = params.id;
    const request: Request | null = await getRequest(requestId);

    if (!request) {
        return <div>Request not found</div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent>
                    <Link href="/dashboard/requests">
                        <Button variant="ghost">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Request Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Request ID</div>
                            <div className="text-sm text-muted-foreground">{request.Id_requete}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Date de traitement</div>
                            <div className="text-sm text-muted-foreground">{request.Date_traitement_requete || '-'}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Date</div>
                            <div className="text-sm text-muted-foreground">{format(new Date(request.Date_requete), "MMM d, yyyy")}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Heure de traitement</div>
                            <div className="text-sm text-muted-foreground">{request.Heure_traitement_requete || '-'}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Client ID</div>
                            <div className="text-sm text-muted-foreground">{request.Id_Client}</div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-sm font-medium">Type</div>
                            <Badge className={getRequestTypeColor(request.Type_requete)}>
                                {request.Type_requete}
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Target</div>
                            <div className="text-sm text-muted-foreground">{request.Cible_requete}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Status</div>
                            <Badge className={getStatusColor(request.Statut_requete)}>
                                {request.Statut_requete}
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Description</div>
                            <div className="text-sm text-muted-foreground">{request.Description_requete}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-sm font-medium">Notes</div>
                            <div className="text-sm text-muted-foreground">{request.Notes_requete || '-'}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default RequestDetailPage;
