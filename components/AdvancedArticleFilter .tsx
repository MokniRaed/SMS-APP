import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Filter, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Article {
    art_marque?: string;
    art_famille?: string;
    art_cat_niv_1?: string;
    art_cat_niv_2?: string;
    art_st?: string;
    art_tb?: string;
    art_designation: string;
    art_id: string;
}

interface AdvancedArticleFilterProps {
    articles: Article[];
    onFilterChange: (filteredArticles: Article[]) => void;
}

type FilterType =
    | 'Marque'
    | 'Famille'
    | 'Catégorie Niveau 1'
    | 'Catégorie Niveau 2'
    | 'Société'
    | 'TB'
    | 'Recherche';

const AdvancedArticleFilter = ({ articles, onFilterChange }: AdvancedArticleFilterProps) => {
    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<{ type: FilterType; value: string }[]>([]);

    // Extract unique values for each filter category
    const uniqueMarques = articles.map(article => article.art_marque).filter((value, index, self) => self.indexOf(value) === index && Boolean(value)) as string[];
    const uniqueFamilles = articles.map(article => article.art_famille).filter((value, index, self) => self.indexOf(value) === index && Boolean(value)) as string[];
    const uniqueNiv1 = articles.map(article => article.art_cat_niv_1).filter((value, index, self) => self.indexOf(value) === index && Boolean(value)) as string[];
    const uniqueNiv2 = articles.map(article => article.art_cat_niv_2).filter((value, index, self) => self.indexOf(value) === index && Boolean(value)) as string[];
    const uniqueST = articles.map(article => article.art_st).filter((value, index, self) => self.indexOf(value) === index && Boolean(value)) as string[];
    const uniqueTB = articles.map(article => article.art_tb).filter((value, index, self) => self.indexOf(value) === index && Boolean(value)) as string[];

    // State for each filter
    const [selectedMarque, setSelectedMarque] = useState('');
    const [selectedFamille, setSelectedFamille] = useState('');
    const [selectedNiv1, setSelectedNiv1] = useState('');
    const [selectedNiv2, setSelectedNiv2] = useState('');
    const [selectedST, setSelectedST] = useState('');
    const [selectedTB, setSelectedTB] = useState('');

    // Apply filters to articles
    useEffect(() => {
        const filtered = articles.filter(article => {
            // Search term filter
            const matchesSearch = !searchTerm ||
                article.art_designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                article.art_id.toLowerCase().includes(searchTerm.toLowerCase());

            // Category filters
            const matchesMarque = !selectedMarque || article.art_marque === selectedMarque;
            const matchesFamille = !selectedFamille || article.art_famille === selectedFamille;
            const matchesNiv1 = !selectedNiv1 || article.art_cat_niv_1 === selectedNiv1;
            const matchesNiv2 = !selectedNiv2 || article.art_cat_niv_2 === selectedNiv2;
            const matchesST = !selectedST || article.art_st === selectedST;
            const matchesTB = !selectedTB || article.art_tb === selectedTB;

            return matchesSearch && matchesMarque && matchesFamille && matchesNiv1 && matchesNiv2 && matchesST && matchesTB;
        });

        onFilterChange(filtered);

        // Update active filters for display
        const newActiveFilters: { type: FilterType; value: string }[] = [];
        if (selectedMarque) newActiveFilters.push({ type: 'Marque', value: selectedMarque });
        if (selectedFamille) newActiveFilters.push({ type: 'Famille', value: selectedFamille });
        if (selectedNiv1) newActiveFilters.push({ type: 'Catégorie Niveau 1', value: selectedNiv1 });
        if (selectedNiv2) newActiveFilters.push({ type: 'Catégorie Niveau 2', value: selectedNiv2 });
        if (selectedST) newActiveFilters.push({ type: 'Société', value: selectedST });
        if (selectedTB) newActiveFilters.push({ type: 'TB', value: selectedTB });
        if (searchTerm) newActiveFilters.push({ type: 'Recherche', value: searchTerm });

        setActiveFilters(newActiveFilters);
    }, [searchTerm, selectedMarque, selectedFamille, selectedNiv1, selectedNiv2, selectedST, selectedTB, articles, onFilterChange]);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedMarque('');
        setSelectedFamille('');
        setSelectedNiv1('');
        setSelectedNiv2('');
        setSelectedST('');
        setSelectedTB('');
        setActiveFilters([]);
    };

    const removeFilter = (filterType: FilterType) => {
        switch (filterType) {
            case 'Marque':
                setSelectedMarque('');
                break;
            case 'Famille':
                setSelectedFamille('');
                break;
            case 'Catégorie Niveau 1':
                setSelectedNiv1('');
                break;
            case 'Catégorie Niveau 2':
                setSelectedNiv2('');
                break;
            case 'Société':
                setSelectedST('');
                break;
            case 'TB':
                setSelectedTB('');
                break;
            case 'Recherche':
                setSearchTerm('');
                break;
            default:
                break;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between gap-2  items-center">
                <div className="relative flex-grow">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par ID ou désignation..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            {activeFilters.length > 0 && (
                                <Badge variant="secondary" className="ml-1">
                                    {activeFilters.length}
                                </Badge>
                            )}
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[800px]">
                        <DialogHeader>
                            <DialogTitle>Filtres avancés</DialogTitle>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Marque</label>
                                <Select value={selectedMarque} onValueChange={setSelectedMarque}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Toutes les marques" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all-marques">Toutes les marques</SelectItem>
                                        {uniqueMarques.map((marque) => (
                                            <SelectItem key={marque} value={marque}>
                                                {marque}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Famille</label>
                                <Select value={selectedFamille} onValueChange={setSelectedFamille}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Toutes les familles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes les familles</SelectItem>
                                        {uniqueFamilles.map((famille) => (
                                            <SelectItem key={famille} value={famille}>
                                                {famille}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Catégorie Niveau 1</label>
                                <Select value={selectedNiv1} onValueChange={setSelectedNiv1}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Toutes les catégories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes les catégories</SelectItem>
                                        {uniqueNiv1.map((niv1) => (
                                            <SelectItem key={niv1} value={niv1}>
                                                {niv1}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Catégorie Niveau 2</label>
                                <Select value={selectedNiv2} onValueChange={setSelectedNiv2}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Toutes les catégories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes les catégories</SelectItem>
                                        {uniqueNiv2.map((niv2) => (
                                            <SelectItem key={niv2} value={niv2}>
                                                {niv2}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Société</label>
                                <Select value={selectedST} onValueChange={setSelectedST}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Toutes les sociétés" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Toutes les sociétés</SelectItem>
                                        {uniqueST.map((st) => (
                                            <SelectItem key={st} value={st}>
                                                {st}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* <div className="space-y-2">
                                <label className="text-sm font-medium">TB</label>
                                <Select value={selectedTB} onValueChange={setSelectedTB}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tous les TB" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les TB</SelectItem>
                                        {uniqueTB.map((tb) => (
                                            <SelectItem key={tb} value={tb}>
                                                {tb}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div> */}
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={clearFilters}>
                                Réinitialiser
                            </Button>
                            <Button onClick={() => setIsFilterDialogOpen(false)}>
                                Appliquer
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {activeFilters.length > 0 ? (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Réinitialiser
                    </Button>
                ) : null}
            </div>

            {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {activeFilters.map((filter, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                            <span className="font-semibold">{filter.type}:</span> {filter.value}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 ml-1 p-0"
                                onClick={() => removeFilter(filter.type)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
};



export default AdvancedArticleFilter;
