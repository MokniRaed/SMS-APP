import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getRequest } from "@/lib/services/requests";
import { Request } from "@/lib/types/request";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
    params: {
        id: string;
    };
}

const EditRequestPage = async ({ params }: Props) => {
    const requestId = params.id;
    const request: Request | null = await getRequest(requestId);

    if (!request) {
        return <div>Request not found</div>;
    }

    // TODO: Implement role-based logic to show/hide fields
    // Admin: Can change status and write notes
    // Client/Collaborateur: Can choose type, service cible, and description

    return (
        <div className="space-y-6">
            <Card>
                <CardContent>
                    <Link href={`/dashboard/requests/${requestId}`}>
                        <Button variant="ghost">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Edit Request</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="ticketName">Ticket Name</Label>
                                <Input id="ticketName" defaultValue={request.Description_requete} disabled />
                            </div>
                            <div>
                                <Label htmlFor="ticketNumber">Ticket Number</Label>
                                <Input id="ticketNumber" defaultValue={request.Id_requete} disabled />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="category">Category/Department</Label>
                            <Select>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HRD">HRD</SelectItem>
                                    <SelectItem value="Finance">Finance</SelectItem>
                                    <SelectItem value="IT">IT</SelectItem>
                                    <SelectItem value="Admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="status">Ticket Status</Label>
                            <Select>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Open">Open</SelectItem>
                                    <SelectItem value="In Progress">In Progress</SelectItem>
                                    <SelectItem value="Closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="Low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea id="notes" defaultValue={request.Notes_requete} />
                        </div>
                        <div>
                            <Label htmlFor="message">Message</Label>
                            <Textarea id="message" defaultValue={request.Description_requete} />
                        </div>
                        <Button type="submit">Update Request</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EditRequestPage;
