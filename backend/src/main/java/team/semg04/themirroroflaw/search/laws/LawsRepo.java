package team.semg04.themirroroflaw.search.laws;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface LawsRepo extends CrudRepository<LawsData, String> {
    List<LawsData> findByTitle(String title);
}
