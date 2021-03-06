# encoding: utf-8

require_relative 'abstract_query_generator'

module CartoDB
  module InternalGeocoder

    class CitiesTextPoints < AbstractQueryGenerator

      def search_terms_query(page)
        %Q{
          SELECT DISTINCT(trim(quote_nullable("#{@internal_geocoder.column_name}"))) AS city
          FROM #{@internal_geocoder.qualified_table_name}
          WHERE cartodb_georef_status IS NULL
          LIMIT #{@internal_geocoder.batch_size} OFFSET #{page * @internal_geocoder.batch_size}
        }
      end

      def dataservices_query(search_terms)
        cities = search_terms.map { |row| row[:city] }.join(',')
        "WITH geo_function AS (SELECT (geocode_namedplace(Array[#{cities}], null, #{country})).*) SELECT q, null, geom, success FROM geo_function"
      end

      def copy_results_to_table_query
        %Q{
          UPDATE #{dest_table}
          SET the_geom = orig.the_geom, cartodb_georef_status = orig.cartodb_georef_status
          #{CartoDB::Importer2::QueryBatcher::QUERY_WHERE_PLACEHOLDER}
          FROM #{@internal_geocoder.temp_table_name} AS orig
          WHERE trim("#{@internal_geocoder.column_name}"::text) = orig.geocode_string AND #{dest_table}.cartodb_georef_status IS NULL
          #{CartoDB::Importer2::QueryBatcher::QUERY_LIMIT_SUBQUERY_PLACEHOLDER}
        }
      end

    end # CitiesTextPoints

  end # InternalGeocoder
end # CartoDB
