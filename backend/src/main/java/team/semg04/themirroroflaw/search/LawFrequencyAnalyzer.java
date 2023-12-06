package team.semg04.themirroroflaw.search;

import com.kennycason.kumo.WordFrequency;
import com.kennycason.kumo.nlp.FrequencyAnalyzer;
import com.kennycason.kumo.nlp.tokenizers.ChineseWordTokenizer;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class LawFrequencyAnalyzer {

    public static List<Map<String, Object>> getAnalyzedJson(String text) {
        final FrequencyAnalyzer frequencyAnalyzer = new FrequencyAnalyzer();
        frequencyAnalyzer.setWordFrequenciesToReturn(600);
        frequencyAnalyzer.setMinWordLength(2);
        frequencyAnalyzer.setWordTokenizer(new ChineseWordTokenizer());
        List<WordFrequency> wordFrequencies = frequencyAnalyzer.load(List.of(text));
        List<Map<String, Object>> rst = new ArrayList<>();
        for(WordFrequency word : wordFrequencies) {
            rst.add(Map.of("name", word.getWord(), "value", word.getFrequency()));
        }
        return rst;
    }
}
