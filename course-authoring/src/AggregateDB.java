import java.sql.SQLException;
import java.sql.Statement;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;


public class AggregateDB extends dbInterface{
	DateFormat dateFormat;
	Date date;
	public AggregateDB(String connurl, String user, String pass){
		super(connurl, user, pass); 
		dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");		
	}	

	/*
	 * @Return: a list of lists. The second list is an ordered list {name,desc} for each domain
	 */
	public ArrayList<ArrayList<String>> getDomains() {
		ArrayList<ArrayList<String>> domainList = new ArrayList<ArrayList<String>>();
		try{
			stmt = conn.createStatement();
			String query = "select name,`desc` from ent_domain;";
			rs = stmt.executeQuery(query);	
			while(rs.next()){
				ArrayList<String> dom = new ArrayList<String>();
				dom.add(rs.getString(1));
				dom.add(rs.getString(2));
				domainList.add(dom);
			}
			this.releaseStatement(stmt,rs);
		}catch (SQLException ex) {
			this.releaseStatement(stmt,rs);
			System.out.println("SQLException: " + ex.getMessage()); 
			System.out.println("SQLState: " + ex.getSQLState()); 
			System.out.println("VendorError: " + ex.getErrorCode());
		}finally{
			this.releaseStatement(stmt,rs);
		}
		return domainList;
	}

	/*
	 * @Return: a list of lists. The second list is an ordered list {id,name} for each author
	 */
	public ArrayList<ArrayList<String>> getCourseAuthors() {
		ArrayList<ArrayList<String>> authorList = new ArrayList<ArrayList<String>>();
		try{
			stmt = conn.createStatement();
			//TODO check the finizlied fields in the ent_creator table
			String query = "select creator_id,creator_name from ent_creator;";
			rs = stmt.executeQuery(query);	
			while(rs.next()){
				ArrayList<String> auth = new ArrayList<String>();
				auth.add(rs.getString(1));
				auth.add(rs.getString(2));
				authorList.add(auth);
			}
			this.releaseStatement(stmt,rs);
		}catch (SQLException ex) {
			this.releaseStatement(stmt,rs);
			System.out.println("SQLException: " + ex.getMessage()); 
			System.out.println("SQLState: " + ex.getSQLState()); 
			System.out.println("VendorError: " + ex.getErrorCode());
		}finally{
			this.releaseStatement(stmt,rs);
		}
		return authorList;
	}

	/*
	 * @Return: a list of lists. The second list is an ordered list {id,name} for each provider
	 */
	public ArrayList<ArrayList<String>> getProviders() {
		ArrayList<ArrayList<String>> providerList = new ArrayList<ArrayList<String>>();
		try{
			stmt = conn.createStatement();
			String query = "select provider_id,name from ent_provider;";
			rs = stmt.executeQuery(query);	
			while(rs.next()){
				ArrayList<String> prov = new ArrayList<String>();
				prov.add(rs.getString(1));
				prov.add(rs.getString(2));
				providerList.add(prov);
			}
			this.releaseStatement(stmt,rs);
		}catch (SQLException ex) {
			this.releaseStatement(stmt,rs);
			System.out.println("SQLException: " + ex.getMessage()); 
			System.out.println("SQLState: " + ex.getSQLState()); 
			System.out.println("VendorError: " + ex.getErrorCode());
		}finally{
			this.releaseStatement(stmt,rs);
		}
		return providerList;
	}
	
	//TODO groupCount added to protocol + term and year is removed from protocol, needs change in processing the information in UI
	/*
	 * @Return: a list of lists. The second list is an ordered list {id,institution_code,name,course_code,creator_name,creation_date,domainId,groupCount,creator_id; 
	 * tags are created based on the available concepts inside the activity
	 * all available courses are returned.
	 */
	public ArrayList<ArrayList<String>> getCourses() {
		ArrayList<ArrayList<String>> courseList = new ArrayList<ArrayList<String>>();
		try{
			stmt = conn.createStatement();
			
			String query = " select c.course_id,cr.affiliation_code, c.course_name, c.course_code, cr.creator_name,c.creation_date,c.domain, count(*) as groupcount,cr.creator_id"
							+ " from ent_course c, ent_creator cr, ent_group g"
							+ " where c.creator_id = cr.creator_id and g.course_id = c.course_id"
							+ " group by course_id;";
			rs = stmt.executeQuery(query);	
			while(rs.next()){
				ArrayList<String> course = new ArrayList<String>();
				course.add(rs.getString(1));
				course.add(rs.getString(2));
				course.add(rs.getString(3));
				course.add(rs.getString(4));
				course.add(rs.getString(5));
				course.add(rs.getString(6));
				course.add(rs.getString(7));
				course.add(rs.getString(8));
				course.add(rs.getString(9));
				courseList.add(course);
			}
			this.releaseStatement(stmt,rs);
		}catch (SQLException ex) {
			this.releaseStatement(stmt,rs);
			System.out.println("SQLException: " + ex.getMessage()); 
			System.out.println("SQLState: " + ex.getSQLState()); 
			System.out.println("VendorError: " + ex.getErrorCode());
		}finally{
			this.releaseStatement(stmt,rs);
		}
		return courseList;
	}

	/*
	 * @Retrun: a list of lists. The second list is an ordered list of {} for each 
	 */
	public ArrayList<ArrayList<String>> getResource(String course_id) {
		ArrayList<ArrayList<String>> resourceList = new ArrayList<ArrayList<String>>();
		try{
			stmt = conn.createStatement();
			String query = "SELECT resource_id,resource_name"
							+ " FROM ent_resource"
							+ " where course_id = '"+course_id+"' order by `order` asc;";
			rs = stmt.executeQuery(query);	
			while(rs.next()){
				ArrayList<String> res = new ArrayList<String>();
				res.add(rs.getString(1));
				res.add(rs.getString(2));
				resourceList.add(res);
			}
			this.releaseStatement(stmt,rs);
		}catch (SQLException ex) {
			this.releaseStatement(stmt,rs);
			System.out.println("SQLException: " + ex.getMessage()); 
			System.out.println("SQLState: " + ex.getSQLState()); 
			System.out.println("VendorError: " + ex.getErrorCode());
		}finally{
			this.releaseStatement(stmt,rs);
		}
		return resourceList;
	}

	/*
	 * @Return: a list of providers_id for the given resource_id
	 */
	public ArrayList<String> getProviders(String resource_id) {
		ArrayList<String> resProvList = new ArrayList<String>();
		try{
			stmt = conn.createStatement();
			String query = " SELECT provider_id "
							+ " FROM rel_resource_provider"
							+ " where resource_id = '"+resource_id+"';";
			rs = stmt.executeQuery(query);	
			while(rs.next()){
				resProvList.add(rs.getString(1));
			}
			this.releaseStatement(stmt,rs);
		}catch (SQLException ex) {
			this.releaseStatement(stmt,rs);
			System.out.println("SQLException: " + ex.getMessage()); 
			System.out.println("SQLState: " + ex.getSQLState()); 
			System.out.println("VendorError: " + ex.getErrorCode());
		}finally{
			this.releaseStatement(stmt,rs);
		}
		return resProvList;
	}

	/*
	 * @Retrun: a list of lists. The second list is an ordered list {unit_id,unit_name}
	 * units are the topics.
	 */
	public ArrayList<ArrayList<String>> getUnits(String course_id) {
		ArrayList<ArrayList<String>> unitList = new ArrayList<ArrayList<String>>();
		try{
			stmt = conn.createStatement();
			String query = "select topic_id, topic_name"
							+ " from ent_topic"
							+ " where course_id = '"+course_id+"'"
									+ "order by `order` asc;";
			rs = stmt.executeQuery(query);	
			while(rs.next()){
				ArrayList<String> unit = new ArrayList<String>();
				unit.add(rs.getString(1));
				unit.add(rs.getString(2));
				unitList.add(unit);
			}
			this.releaseStatement(stmt,rs);
		}catch (SQLException ex) {
			this.releaseStatement(stmt,rs);
			System.out.println("SQLException: " + ex.getMessage()); 
			System.out.println("SQLState: " + ex.getSQLState()); 
			System.out.println("VendorError: " + ex.getErrorCode());
		}finally{
			this.releaseStatement(stmt,rs);
		}
		return unitList;
	}

	/*
	 * @Return: a list of lists. The second list is an ordered list {id,providerId,name,authorId,url,domain,tags}; 
	 * tags are created based on the available concepts inside the activity
	 */
	public ArrayList<ArrayList<String>> getActivities() {
		ArrayList<ArrayList<String>> activityList = new ArrayList<ArrayList<String>>();
		HashMap<String,String> contentTags = getContentTags();
		try{
			stmt = conn.createStatement();
			String query = "select content_id,provider_id,display_name,creator_id,url,domain from ent_content;";
			rs = stmt.executeQuery(query);	
			while(rs.next()){
				ArrayList<String> act = new ArrayList<String>();
				act.add(rs.getString(1));
				act.add(rs.getString(2));
				act.add(rs.getString(3));
				act.add(rs.getString(4));
				act.add(rs.getString(5));
				act.add(rs.getString(6));
				act.add(contentTags.get(rs.getString(1)));
				activityList.add(act);
			}
			this.releaseStatement(stmt,rs);
		}catch (SQLException ex) {
			this.releaseStatement(stmt,rs);
			System.out.println("SQLException: " + ex.getMessage()); 
			System.out.println("SQLState: " + ex.getSQLState()); 
			System.out.println("VendorError: " + ex.getErrorCode());
		}finally{
			this.releaseStatement(stmt,rs);
		}
		return activityList;
	}

	/*
	 * @Return: A hash map containing content as key, and its comma-separated tags as value
	 */
	private HashMap<String, String> getContentTags() {
		HashMap<String,String> contentTags = new HashMap<String,String>();
		try{
			stmt = conn.createStatement();
			String query = " select entity_id, group_concat(tag separator ',') as tags"
							+ " from ent_tagging"
							+ " group by entity_id;";
			rs = stmt.executeQuery(query);	
			while(rs.next()){
				contentTags.put(rs.getString(1),rs.getString(2));
			}
			this.releaseStatement(stmt,rs);
		}catch (SQLException ex) {
			this.releaseStatement(stmt,rs);
			System.out.println("SQLException: " + ex.getMessage()); 
			System.out.println("SQLState: " + ex.getSQLState()); 
			System.out.println("VendorError: " + ex.getErrorCode());
		}finally{
			this.releaseStatement(stmt,rs);
		}
		return contentTags;
	}

	/*
	 * @Return: a hash map containing the resource of the unit as key, and the activities inside that resource as value
	 */
	public HashMap<String, ArrayList<String>> getResourceActivity(String unit_id) {
		HashMap<String,ArrayList<String>> resActMap = new HashMap<String,ArrayList<String>>();
		try{
			stmt = conn.createStatement();
			String query = "SELECT resource_id,content_id"
							+ " FROM rel_topic_content"
							+ " where topic_id = '"+unit_id+"';";
			rs = stmt.executeQuery(query);	
			String res;
			String act;
			while(rs.next()){
				res = rs.getString(1);
				act = rs.getString(2);
				ArrayList<String> acts = resActMap.get(res);
				if (acts == null)
					acts = new ArrayList<String>();
				else
					acts.add(act);
				acts.add(act);
				resActMap.put(res, acts);
			}
			this.releaseStatement(stmt,rs);
		}catch (SQLException ex) {
			this.releaseStatement(stmt,rs);
			System.out.println("SQLException: " + ex.getMessage()); 
			System.out.println("SQLState: " + ex.getSQLState()); 
			System.out.println("VendorError: " + ex.getErrorCode());
		}finally{
			this.releaseStatement(stmt,rs);
		}
		return resActMap;
	}

	public Integer addRes(String cid, String name, String usr) {
		Integer resid = null;
		int neworder = gentMaxResOrder(cid)+1;
		try{
			stmt = conn.createStatement();
			date = new Date();
			String query = "insert into ent_resource (course_id,resource_name,display_name,`order`,creation_date,creator_id,visible)"
					+ " value ('"+cid+"','"+name+"','"+name+"','"+neworder+"','"+dateFormat.format(date)+"','"+usr+"','1');";
			stmt.executeUpdate(query,Statement.RETURN_GENERATED_KEYS);				
			rs = stmt.getGeneratedKeys();
	        if (rs.next()){
	            resid=rs.getInt(1);
	        }
			this.releaseStatement(stmt,rs);
			return resid;
		}catch (SQLException ex) {
			this.releaseStatement(stmt,rs);
			System.out.println("SQLException: " + ex.getMessage()); 
			System.out.println("SQLState: " + ex.getSQLState()); 
			System.out.println("VendorError: " + ex.getErrorCode());
			return resid;
		}finally{
			this.releaseStatement(stmt,rs);
		}	
	}

	private int gentMaxResOrder(String cid) {
		int maxorder = 0;
		try{
			stmt = conn.createStatement();
			String query = "select max(`order`) from ent_resource where course_id = '"+cid+"';";
			rs = stmt.executeQuery(query);	
			while(rs.next()){
				maxorder = rs.getInt(1);
			}
			this.releaseStatement(stmt,rs);
		}catch (SQLException ex) {
			this.releaseStatement(stmt,rs);
			System.out.println("SQLException: " + ex.getMessage()); 
			System.out.println("SQLState: " + ex.getSQLState()); 
			System.out.println("VendorError: " + ex.getErrorCode());
		}finally{
			this.releaseStatement(stmt,rs);
		}
		return maxorder;
	}

	public boolean editRes(String resid, String name) {
		try{
			stmt = conn.createStatement();
			String query = "update ent_resource set resource_name = '"+name+"', display_name='"+name+"' where resource_id = '"+resid+"';";
			stmt.executeUpdate(query);				
			this.releaseStatement(stmt,rs);
			return true;
		}catch (SQLException ex) {
			this.releaseStatement(stmt,rs);
			System.out.println("SQLException: " + ex.getMessage()); 
			System.out.println("SQLState: " + ex.getSQLState()); 
			System.out.println("VendorError: " + ex.getErrorCode());
			return false;
		}finally{
			this.releaseStatement(stmt,rs);
		}	
	}

	public boolean deleteRes(String resid) {
		try{
			//step1: delete from resource_provider where resource_id =?
			stmt = conn.createStatement();
			String query = "delete from rel_resource_provider where resource_id = '"+resid+"';";
			stmt.executeUpdate(query);
			//step2: delete from rel_topic_content where resource_id =?
			query = "delete from rel_topic_content where resource_id = '"+resid+"';";
			stmt.executeUpdate(query);
			//step3: delete from ent_resource where resource_id = ?
			query = "delete from ent_resource where resource_id = '"+resid+"';";
			stmt.executeUpdate(query);
			this.releaseStatement(stmt,rs);
			return true;
		}catch (SQLException ex) {
			this.releaseStatement(stmt,rs);
			System.out.println("SQLException: " + ex.getMessage()); 
			System.out.println("SQLState: " + ex.getSQLState()); 
			System.out.println("VendorError: " + ex.getErrorCode());
			return false;
		}finally{
			this.releaseStatement(stmt,rs);
		}		
	}

	public boolean swapRes(String resid1, int idx, int idxDelta) {
		try{
			stmt = conn.createStatement();
			String query;
			int resid2=0,idx2=0,idx1=0;
			//find the res that will be swapped by the resid1
			if (idxDelta > 0)
				query = "select resource_id,`order` from ent_resource order by `order` limit "+idx+",1;"; //the record below resid1
			else
				query = "select resource_id,`order` from ent_resource order by `order` limit "+(idx-2)+",1;"; //the record above resid1
			rs = stmt.executeQuery(query);				
	        if (rs.next()){
	            resid2=rs.getInt(1);
	            idx2=rs.getInt(2);
	        }	
			//find the order of resid1
			query = "select `order` from ent_resource where resource_id = '"+resid1+"';";
			rs = stmt.executeQuery(query);				
	        if (rs.next()){
	            idx1=rs.getInt(1);
	        }	
	        //set the order of the resid2 as idx1
			query = "update ent_resource set `order` = '"+idx1+"' where resource_id = '"+resid2+"';";
			stmt.executeUpdate(query);	
			//set the order of the resid1 as idx2
			query = "update ent_resource set `order` = '"+idx2+"' where resource_id = '"+resid1+"';";
			stmt.executeUpdate(query);	
			this.releaseStatement(stmt,rs);
			return true;
		}catch (SQLException ex) {
			this.releaseStatement(stmt,rs);
			System.out.println("SQLException: " + ex.getMessage()); 
			System.out.println("SQLState: " + ex.getSQLState()); 
			System.out.println("VendorError: " + ex.getErrorCode());
			return false;
		}finally{
			this.releaseStatement(stmt,rs);
		}	
	
	}

	public boolean addResProvider(String resid, String provid) {
		try{
			stmt = conn.createStatement();
			String query = "insert into rel_resource_provider (resource_id,provider_id) value ('"+resid+"','"+provid+"');";					
			stmt.executeUpdate(query);				
			this.releaseStatement(stmt,rs);
			return true;
		}catch (SQLException ex) {
			this.releaseStatement(stmt,rs);
			System.out.println("SQLException: " + ex.getMessage()); 
			System.out.println("SQLState: " + ex.getSQLState()); 
			System.out.println("VendorError: " + ex.getErrorCode());
			return false;
		}finally{
			this.releaseStatement(stmt,rs);
		}	
	}

	public boolean deleteResProvider(String resid, String provid) {
		try{
			stmt = conn.createStatement();
			String query = "delete from rel_resource_provider where resource_id='"+resid+"' and provider_id='"+provid+"';";					
			stmt.executeUpdate(query);				
			this.releaseStatement(stmt,rs);
			return true;
		}catch (SQLException ex) {
			this.releaseStatement(stmt,rs);
			System.out.println("SQLException: " + ex.getMessage()); 
			System.out.println("SQLState: " + ex.getSQLState()); 
			System.out.println("VendorError: " + ex.getErrorCode());
			return false;
		}finally{
			this.releaseStatement(stmt,rs);
		}
	}

	public Integer addUnit(String cid, String name, String usr) {
		Integer uid = null;
		int neworder = getMaxUnitOrder(cid)+1;
		try{
			stmt = conn.createStatement();
			date = new Date();
			String query = "insert into ent_topic (course_id,topic_name,display_name,`order`,creation_date,creator_id,visible,active)"
					+ " value ('"+cid+"','"+name+"','"+name+"','"+neworder+"','"+dateFormat.format(date)+"','"+usr+"','1','1');";
			stmt.executeUpdate(query,Statement.RETURN_GENERATED_KEYS);				
			rs = stmt.getGeneratedKeys();
	        if (rs.next()){
	            uid=rs.getInt(1);
	        }
			this.releaseStatement(stmt,rs);
			return uid;
		}catch (SQLException ex) {
			this.releaseStatement(stmt,rs);
			System.out.println("SQLException: " + ex.getMessage()); 
			System.out.println("SQLState: " + ex.getSQLState()); 
			System.out.println("VendorError: " + ex.getErrorCode());
			return uid;
		}finally{
			this.releaseStatement(stmt,rs);
		}		
	}

	private int getMaxUnitOrder(String cid) {
		int maxorder = 0;
		try{
			stmt = conn.createStatement();
			String query = "select max(`order`) from ent_topic where course_id = '"+cid+"';";
			rs = stmt.executeQuery(query);	
			while(rs.next()){
				maxorder = rs.getInt(1);
			}
			this.releaseStatement(stmt,rs);
		}catch (SQLException ex) {
			this.releaseStatement(stmt,rs);
			System.out.println("SQLException: " + ex.getMessage()); 
			System.out.println("SQLState: " + ex.getSQLState()); 
			System.out.println("VendorError: " + ex.getErrorCode());
		}finally{
			this.releaseStatement(stmt,rs);
		}
		return maxorder;
	}

	public boolean editUnit(String uid, String name) {
		try{
			stmt = conn.createStatement();
			String query = "update ent_topic set topic_name = '"+name+"', display_name='"+name+"' where topic_id = '"+uid+"';";
			stmt.executeUpdate(query);				
			this.releaseStatement(stmt,rs);
			return true;
		}catch (SQLException ex) {
			this.releaseStatement(stmt,rs);
			System.out.println("SQLException: " + ex.getMessage()); 
			System.out.println("SQLState: " + ex.getSQLState()); 
			System.out.println("VendorError: " + ex.getErrorCode());
			return false;
		}finally{
			this.releaseStatement(stmt,rs);
		}	
	}

	public boolean deleteUnit(String uid) {
		try{
			//step1:delete from rel_topic_content where topic_id = ?
			stmt = conn.createStatement();
			String query = "delete from rel_topic_content where topic_id = '"+uid+"';";
			stmt.executeUpdate(query);
			//step2: delete from ent_topic where topic_id = ?
			query = "delete from ent_topic where topic_id = '"+uid+"';";
			stmt.executeUpdate(query);
			this.releaseStatement(stmt,rs);
			return true;
		}catch (SQLException ex) {
			this.releaseStatement(stmt,rs);
			System.out.println("SQLException: " + ex.getMessage()); 
			System.out.println("SQLState: " + ex.getSQLState()); 
			System.out.println("VendorError: " + ex.getErrorCode());
			return false;
		}finally{
			this.releaseStatement(stmt,rs);
		}		
	}

	public boolean swapUnit(String uid1, int idx, int idxDelta) {
		try{
			stmt = conn.createStatement();
			String query;
			int uid2=0,idx2=0,idx1=0;
			//find the unit that will be swapped by the uid1
			if (idxDelta > 0)
				query = "select topic_id,`order` from ent_topic order by `order` limit "+idx+",1;"; //the record below uid1
			else
				query = "select topic_id,`order` from ent_topic order by `order` limit "+(idx-2)+",1;"; //the record above uid1
			rs = stmt.executeQuery(query);				
	        if (rs.next()){
	            uid2=rs.getInt(1);
	            idx2=rs.getInt(2);
	        }	
			//find the order of uid1
			query = "select `order` from ent_topic where topic_id = '"+uid1+"';";
			rs = stmt.executeQuery(query);				
	        if (rs.next()){
	            idx1=rs.getInt(1);
	        }	
	        //set the order of the uid2 as idx1
			query = "update ent_topic set `order` = '"+idx1+"' where topic_id = '"+uid2+"';";
			stmt.executeUpdate(query);	
			//set the order of the uid1 as idx2
			query = "update ent_topic set `order` = '"+idx2+"' where topic_id = '"+uid1+"';";
			stmt.executeUpdate(query);	
			this.releaseStatement(stmt,rs);
			return true;
		}catch (SQLException ex) {
			this.releaseStatement(stmt,rs);
			System.out.println("SQLException: " + ex.getMessage()); 
			System.out.println("SQLState: " + ex.getSQLState()); 
			System.out.println("VendorError: " + ex.getErrorCode());
			return false;
		}finally{
			this.releaseStatement(stmt,rs);
		}	
	}		
}
