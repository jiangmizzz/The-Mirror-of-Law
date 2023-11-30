package team.semg04.themirroroflaw.search;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import team.semg04.themirroroflaw.search.laws.LawsRepo;

@RestController
@RequestMapping("/api/search")
@Tag(name = "Search", description = "Search for everything")
public class SearchController {

    private LawsRepo lawsRepo;

    @Autowired
    public void setLawsRepo(LawsRepo lawsRepo) {
        this.lawsRepo = lawsRepo;
    }

    // FIXME: This is just a demo, please delete it later
    @PostMapping("/laws")
    public String searchLaws(String keyword) {
        return lawsRepo.findByTitle(keyword).toString();
    }
}
