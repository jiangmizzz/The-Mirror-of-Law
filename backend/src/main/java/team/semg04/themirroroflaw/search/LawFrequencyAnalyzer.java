package team.semg04.themirroroflaw.search;

import com.kennycason.kumo.WordFrequency;
import com.kennycason.kumo.nlp.FrequencyAnalyzer;
import com.kennycason.kumo.nlp.tokenizers.ChineseWordTokenizer;
import org.springframework.core.io.ClassPathResource;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class LawFrequencyAnalyzer {

    public static List<Map<String, Object>> getAnalyzedJson(String text) {
        final FrequencyAnalyzer frequencyAnalyzer = new FrequencyAnalyzer();
        frequencyAnalyzer.setWordFrequenciesToReturn(100);
        frequencyAnalyzer.setMinWordLength(2);
        frequencyAnalyzer.setStopWords(getStopWordList());
        frequencyAnalyzer.setWordTokenizer(new ChineseWordTokenizer());
        List<WordFrequency> wordFrequencies = frequencyAnalyzer.load(List.of(text));
        List<Map<String, Object>> rst = new ArrayList<>();
        for(WordFrequency word : wordFrequencies) {
            rst.add(Map.of("name", word.getWord(), "value", word.getFrequency()));
        }
        return rst;
    }

    public static List<String> getStopWordList() {
        List<String> stopWords = new ArrayList<>();
        ClassPathResource resource = new ClassPathResource("stopwords.txt");
        try (BufferedReader br = new BufferedReader(new InputStreamReader(resource.getInputStream()))) {
            String line;
            while ((line = br.readLine()) != null) {
                stopWords.add(line);
            }
        } catch (IOException e) {
//            e.printStackTrace();
        }
        return stopWords;
    }
}
